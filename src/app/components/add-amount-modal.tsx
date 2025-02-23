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

interface AddAmountModalProps {
  onSuccess: () => void;
}

const addAmount = async ({
  amount,
  token,
}: {
  amount: string;
  token: string;
}) => {
  const response = await fetch("/api/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, token }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "插入失败，请重试");
  }
  return data;
};

const AddAmountModal = ({ onSuccess }: AddAmountModalProps) => {
  const [amount, setAmount] = useState<number | string | "">("");
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, token } = useAuth();

  // 处理金额提交
  const addMutation = useMutation({
    mutationFn: addAmount,
    onSuccess: (data) => {
      setAmount("");
      setIsOpen(false);
      toast.success(data.message || "金额已成功插入");
      onSuccess(); // 触发数据刷新
    },
    onError: (error: any) => {
      toast.error(error.message || "插入失败，请重试");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sanitizedAmount = String(amount).replace(/,/g, "");

    if (sanitizedAmount === "" || isNaN(Number(sanitizedAmount))) {
      toast.error("请输入有效的金额");
      return;
    }

    if (!token) {
      toast.error("用户未登录");
      return;
    }

    addMutation.mutate({ amount: sanitizedAmount, token });
  };

  return (
    <>
      {isAuthenticated && <Button onClick={() => setIsOpen(true)}>添加</Button>}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>添加数据</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            <label htmlFor="amount" className="block text-sm font-medium">
              输入金额:
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
            <DialogFooter>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "提交中..." : "提交"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddAmountModal;
