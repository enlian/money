"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "登录失败");
  }

  return data;
};

const LoginModal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { setToken, isAuthenticated, logout } = useAuth();

  // 处理登录
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setIsOpen(false);
      toast.success("登录成功");
    },
    onError: (error: any) => {
      toast.error(error.message || "发生未知错误，请稍后重试");
    },
  });

  // 处理登出
  const logoutMutation = useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      toast.success("已退出登录");
    },
  });

  return (
    <>
      {!isAuthenticated ? (
        <Button onClick={() => setIsOpen(true)}>登录</Button>
      ) : (
        <Button className="bg-gray-400" onClick={() => logoutMutation.mutate()}>
          退出
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate({ username, password });
            }}
            className="space-y-4 mt-3"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {loginMutation.isError && (
              <p className="text-red-500 text-sm">
                {loginMutation.error?.message}
              </p>
            )}
            <DialogFooter>
              <Button
                className="text-white"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "登录中..." : "登录"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginModal;
