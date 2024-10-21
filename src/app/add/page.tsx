"use client";

import { useState } from "react";

const AddAmountPage = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (amount === "" || isNaN(Number(amount))) {
      setMessage("请输入有效的金额");
      return;
    }

    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const result = await res.json();
      setMessage(result.message || "金额已成功插入");
      setAmount(""); // 清空输入框
    } catch (error) {
      setMessage("插入失败，请重试");
    }
  };

  return (
    <div>
      <h1>添加金额</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="amount">输入金额:</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
        <button type="submit">提交</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AddAmountPage;
