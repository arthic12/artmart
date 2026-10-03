const Order = require("../models/Order");
const Artwork = require("../models/Artwork");

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

// POST /orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = "Cash on delivery", upiId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    if (paymentMethod === "UPI" && !UPI_REGEX.test(String(upiId || "").trim())) {
      return res.status(400).json({ message: "Please enter a valid UPI ID" });
    }

    // Build order items from the database so prices can't be tampered with
    const orderItems = [];
    let totalAmount = 0;

    for (const it of items) {
      const art = await Artwork.findById(it.artworkId);
      if (!art) {
        return res.status(404).json({ message: "An artwork in your cart no longer exists" });
      }
      const quantity = Math.max(1, Number(it.quantity) || 1);
      orderItems.push({
        artwork: art._id,
        title: art.title,
        image: art.image,
        price: art.price,
        quantity,
      });
      totalAmount += art.price * quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        ...shippingAddress,
        email: shippingAddress?.email || req.user.email,
      },
      paymentMethod,
      upiId: paymentMethod === "UPI" ? upiId.trim() : undefined,
      totalAmount,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /orders/:id  (owner or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = String(order.user._id) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to view this order" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /orders/:id/cancel  (owner only, before it ships)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed to cancel this order" });
    }

    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({ message: `A ${order.status.toLowerCase()} order cannot be cancelled` });
    }

    order.status = "Cancelled";
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /orders  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    // Cash on delivery is collected when the order is delivered
    if (status === "Delivered") order.paymentStatus = "paid";
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};