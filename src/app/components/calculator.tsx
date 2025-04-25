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
import React, { useEffect, useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { toast } from "sonner";

type Row = {
  amount: number;
  currency: "CNY" | "USD";
};

interface CalculatorProps {
  onTotalChange: (total: number) => void; // 父组件传入的回调函数
}

const Calculator = React.memo(({ onTotalChange }: CalculatorProps) => {
  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 5 }, () => ({ amount: 0, currency: "CNY" }))
  );

  const handleAmountChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index].amount = parseFloat(value) || 0;
    setRows(updated);
  };

  const handleCurrencyChange = (index: number, currency: "CNY" | "USD") => {
    const updated = [...rows];
    updated[index].currency = currency;
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, { amount: 0, currency: "CNY" }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const getTotalInCNY = () => {
    return rows.reduce((sum, row) => {
      const rate = row.currency === "USD" ? 7 : 1;
      return sum + row.amount * rate;
    }, 0);
  };

  useEffect(() => {
    onTotalChange(getTotalInCNY());
  }, [rows, onTotalChange]);

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex flex-col gap-4 items-center">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-3 items-center">
            <input
              type="number"
              className="w-32 p-2 rounded bg-gray-800 text-white border border-gray-600"
              value={row.amount}
              onChange={(e) => handleAmountChange(index, e.target.value)}
              placeholder="金额"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleCurrencyChange(index, "CNY")}
                className={`px-3 py-1 rounded border ${
                  row.currency === "CNY"
                    ? "bg-green-600 border-green-400"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                人民币
              </button>
              <button
                onClick={() => handleCurrencyChange(index, "USD")}
                className={`px-3 py-1 rounded border ${
                  row.currency === "USD"
                    ? "bg-yellow-600 border-yellow-400"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                美元
              </button>
            </div>
            <IoMdClose
              size={24}
              className="cursor-pointer text-red-500 hover:text-red-700 ml-2"
              onClick={() => handleRemoveRow(index)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-xl text-center">
          合计金额（人民币）￥{getTotalInCNY().toFixed(2)}
        </span>

        <button
          onClick={handleAddRow}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded w-fit self-center flex items-center justify-center"
        >
          <IoMdAdd size={20} />
        </button>
      </div>
    </div>
  );
});

const AddAmountModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [total, setTotal] = useState(0);

  const handleTotalChange = (total: number) => {
    setTotal(total); // 更新父组件的状态
  };

  // 处理金额提交
  const addAmount = async ({ total }: { total: string }) => {
    const res = await fetch("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const addMutation = useMutation({
    mutationFn: (total: number) => addAmount({ total: total.toString() }),
    onSuccess: (data) => {
      setTotal(0);
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
    const sanitizedTotal = String(total).replace(/,/g, "");

    if (sanitizedTotal === "" || isNaN(Number(sanitizedTotal))) {
      toast.error("请输入有效的金额");
      return;
    }

    if (!session) {
      toast.error("用户未登录");
      return;
    }

    addMutation.mutate(total);
  };

  return (
    <>
      {session && <Button onClick={() => setIsOpen(true)}>添加</Button>}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[80vw] bg-gray-800">
          <DialogHeader>
            <DialogTitle>添加数据</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            <Calculator onTotalChange={handleTotalChange} />
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
