"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface AddAmountModalProps {
  onSuccess: () => void;
}

const addAmount = async ({ amount }: { amount: string }) => {
  const res = await fetch("/api/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);
  return data;
};

const AddAmountModal = ({ onSuccess }: AddAmountModalProps) => {
  const [amount, setAmount] = useState<number | string | "">("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  // 处理金额提交
  const addMutation = useMutation({
    mutationFn: addAmount,
    onSuccess: (data) => {
      setAmount("");
      setIsOpen(false);
      toast.success(data.message || "金额已成功插入");
      onSuccess();
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

    if (!session) {
      toast.error("用户未登录");
      return;
    }

    addMutation.mutate({ amount: sanitizedAmount });
  };

  return (
    <>
      {session && <Button onClick={() => setIsOpen(true)}>添加</Button>}
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
