"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return setLoading(false);
    let mounted = true;
    (async function load() {
      try {
        const me = await apiFetch("/api/auth/me");
        if (!mounted) return;
        setUser(me || null);
      } catch (e) {
        setUser(null);
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [token]);

  const login = async ({ email, password } = {}) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res && res.token) {
      localStorage.setItem("token", res.token);
      setToken(res.token);
    }
    if (res && res.user) setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(user.roles)) return user.roles.includes(role);
    return user.role === role || (user.roles && user.roles.indexOf(role) !== -1);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

export default AuthProvider;
