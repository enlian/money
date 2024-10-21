"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext"; // 使用 AuthContext
import "./AddAmountModal.css";

const AddAmountModal = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth(); // 获取是否认证状态

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

      if (res.ok) {
        setMessage(result.message || "金额已成功插入");
        setAmount(""); // 清空输入框
        setIsOpen(false); // 成功时关闭弹窗
      } else {
        setMessage(result.message || "插入失败，请重试");
      }
    } catch (error) {
      setMessage("插入失败，请重试");
    }
  };

  return (
    <>
      {/* 只有在用户认证通过后才显示“添加金额”按钮 */}
      {isAuthenticated && <button onClick={() => setIsOpen(true)}>添加</button>}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h3>添加数据</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="amount">输入金额:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
          <p className="error-text">{message}</p>

          <button type="submit">提交</button>
        </form>
      </Modal>
    </>
  );
};

export default AddAmountModal;
