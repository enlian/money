"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean; // 表示认证状态
  isAuthenticating: boolean; // 用于鉴权中的加载状态
  verifyToken: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // 初始为 false，但会在验证后更新
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true); // 用于鉴权中的加载状态

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      verifyToken(storedToken);
    } else {
      setIsAuthenticating(false); // 没有 token，直接结束鉴权状态
    }
  }, []);

  const verifyToken = async (token: string | null = null) => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      setIsAuthenticated(false); // 没有 token，表示用户未认证
      setIsAuthenticating(false);
      return;
    }

    try {
      const response = await fetch("/api/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: currentToken }),
      });

      const result = await response.json();
      if (result.valid) {
        setIsAuthenticated(true); // 认证成功
      } else {
        localStorage.removeItem("token");
        setIsAuthenticated(false); // 认证失败
        setToken(null);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setIsAuthenticated(false); // 发生错误时也视为未认证
      setToken(null);
    } finally {
      setIsAuthenticating(false); // 结束鉴权状态
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isAuthenticated,
        isAuthenticating, // 用于鉴权中的加载状态
        verifyToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
