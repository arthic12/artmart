import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("artmart_user");
    return saved ? JSON.parse(saved) : null;
  });

  const save = (data) => {
    localStorage.setItem("artmart_user", JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) =>
    save(await api("/auth/login", { method: "POST", body: { email, password } }));

  const register = async (name, email, password, role) =>
    save(await api("/auth/register", { method: "POST", body: { name, email, password, role } }));

  const logout = () => {
    localStorage.removeItem("artmart_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);