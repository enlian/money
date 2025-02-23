"use client";

import { useState } from "react";
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

const AddAmountModal = ({ onSuccess }: AddAmountModalProps) => {
  const [amount, setAmount] = useState<number | string | "">("");
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sanitizedAmount = String(amount).replace(/,/g, "");
    if (sanitizedAmount === "" || isNaN(Number(sanitizedAmount))) {
      toast.error("请输入有效的金额");
      return;
    }
    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: sanitizedAmount, token }),
      });
      const result = await res.json();
      if (res.ok) {
        setAmount("");
        setIsOpen(false);
        toast.success(result.message || "金额已成功插入");
        onSuccess();
      } else {
        toast.error(result.message || "插入失败，请重试");
      }
    } catch (error) {
      toast.error("插入失败，请重试");
    }
  };

  return (
    <>
      {isAuthenticated && <Button onClick={() => setIsOpen(true)}>添加</Button>}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加数据</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit">提交</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddAmountModal;
