"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  });

  // 使用 React Query 进行 token 验证
  const { data, isLoading } = useQuery({
    queryKey: ["validateToken", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const response = await fetch("/api/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Token validation failed");
      return response.json();
    },
    enabled: !!token, // 只有 token 存在时才请求
    retry: 1, // 失败时最多重试 1 次
    staleTime: 1000 * 60 * 5, // 5 分钟内不会重新请求
  });

  // 处理登录
  const loginMutation = useMutation({
    mutationFn: async (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      queryClient.invalidateQueries({ queryKey: ["validateToken"] }); // 重新验证 token
    },
  });

  // 处理退出
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.clear(); // 清除所有缓存
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken: (newToken) => {
          if (newToken !== null) {
            loginMutation.mutate(newToken);
          }
        },
        isAuthenticated: !!data?.valid,
        isAuthenticating: isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
