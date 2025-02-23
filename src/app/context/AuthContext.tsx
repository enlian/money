"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
    // ✅ 只能在客户端访问 localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });

  // ✅ 监听 token 变化，确保持久化
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ 使用 React Query 进行 token 验证
  const { data, isLoading } = useQuery({
    queryKey: ["validateToken", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const response = await fetch("/api/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) return { valid: false }; // ✅ 避免错误时影响状态
      return response.json();
    },
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ 处理登录
  const loginMutation = useMutation({
    mutationFn: async (newToken: string) => {
      setToken(newToken);
      queryClient.invalidateQueries({ queryKey: ["validateToken"] });
    },
  });

  // ✅ 处理退出
  const logout = () => {
    setToken(null);
    queryClient.removeQueries({ queryKey: ["validateToken"] });
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
        isAuthenticated: Boolean(data?.valid),
        isAuthenticating: isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
