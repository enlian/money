"use client";

import { useEffect, useState } from "react";
import "chart.js/auto";
import LoginModal from "./components/login-modal";
import AddAmountModal from "./components/add-amount-modal";
import { useAuth } from "./context/AuthContext";
import Header from "./components/header-info";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Charts from "./components/charts";
import type { AllData } from "./lib/types";
import Error from "./components/error";

const AssetsPage = () => {
  const [data, setData] = useState<AllData | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isAuthenticated, isAuthenticating, token } = useAuth();

  const fetchData = async () => {
    try {
      let data, response;
      if (isAuthenticated) {
        response = await fetch("/api/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      } else {
        response = await fetch("/api/visitor-assets");
      }
      data = await response.json();
      setData(data);
      setRate(data.exchangeRate); //设置汇率
    } catch (error) {
      setErrorMessage("无法获取数据，请稍后重试");
    }
  };

  useEffect(() => {
    if (!isAuthenticating) {
      fetchData(); // 仅在 `isAuthenticating` 为 false 时发起请求
    }
  }, [isAuthenticated, isAuthenticating]);

  if (errorMessage) {
    return <Error errorMessage={errorMessage} fetchData={fetchData} />;
  }

  if (!data?.assets.length) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 h-full">
      <div className="flex justify-end gap-3">
        <LoginModal />
        <AddAmountModal onSuccess={fetchData} />
      </div>

      <Header data={data} rate={rate ?? 0} />
      <Charts data={data} />
    </div>
  );
};

export default AssetsPage;
