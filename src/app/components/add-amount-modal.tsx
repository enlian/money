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
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { toast } from "sonner";
import { z } from "zod"; // 导入 zod

// Zod schema for validation
const amountSchema = z.array(
  z.object({
    amount: z
      .number()
      .min(1, { message: "金额必须大于0" }) // 保证金额大于0
      .max(10000000, { message: "金额不能超过1000万" }),
    currency: z.enum(["CNY", "USD"]),
  })
);

const defaultRows = [
  { amount: 0, currency: "CNY" },
  { amount: 0, currency: "CNY" },
  { amount: 0, currency: "CNY" },
  { amount: 0, currency: "CNY" },
  { amount: 0, currency: "CNY" },
];

const AddAmountModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [rows, setRows] = useState(defaultRows);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index].amount = parseInt(value) || 0; // 只保留整数
    setRows(updated);
  };

  const handleCurrencyChange = (index: number, currency: "CNY" | "USD") => {
    const updated = [...rows];
    updated[index].currency = currency;
    setRows(updated);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;

    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, { amount: 0, currency: "CNY" }]);
  };

  const getTotalInCNY = () => {
    return rows.reduce((sum, row) => {
      const rate = row.currency === "USD" ? 7 : 1;
      return sum + row.amount * rate;
    }, 0);
  };

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

  const handleSubmit = () => {
    // 使用 zod 验证输入
    const validation = amountSchema.safeParse(rows);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message); // 直接显示第一个错误信息
      return;
    }

    const sanitizedTotal = String(total).replace(/,/g, "");
    if (sanitizedTotal === "" || isNaN(Number(sanitizedTotal))) {
      toast.error("请输入有效的金额");
      return;
    }

    if (!session) {
      toast.error("用户未登录");
      return;
    }

    setIsSubmitting(true);
    addMutation.mutate(total);
  };

  return (
    <>
      {session && (
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center p-2"
        >
          <IoMdAdd size={20} />
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[500] bg-gray-800 p-6 rounded-md border border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">添加数据</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-3">
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-4 items-center">
                {rows.map((row, index) => (
                  <div key={index} className="flex gap-3 items-center w-full">
                    <input
                      type="text"
                      className="text-lg w-32 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={row.amount}
                      onChange={(e) =>
                        handleAmountChange(index, e.target.value)
                      }
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

              <div className="flex justify-between items-center mt-2">
                <span className="text-white">
                  合计（人民币）￥
                  <span className="text-xl">{getTotalInCNY()}</span>
                </span>

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  <IoMdAdd size={20} />
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleSubmit}
                className={`w-full p-5 text-white rounded-md ${
                  isSubmitting || addMutation.isPending
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={addMutation.isPending || isSubmitting}
              >
                {isSubmitting || addMutation.isPending ? "提交中..." : "提交"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddAmountModal;
