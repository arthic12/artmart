const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every order route needs login

router.post("/", createOrder);
router.get("/my", getMyOrders); // must stay above "/:id"
router.get("/", restrictTo("admin"), getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/status", restrictTo("admin"), updateOrderStatus);

module.exports = router;