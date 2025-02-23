"use client";

import { useEffect, useState } from "react";
import "chart.js/auto";
import LoginModal from "./components/login-modal";
import AddAmountModal from "./components/add-amount-modal";
import { useAuth } from "./context/AuthContext";
import Header from "./components/header-info";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Chart from "./components/chart";
import type { AllData } from "./lib/types";

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
      setErrorMessage("无法获取数据，请稍后重试: " + error);
    }
  };

  useEffect(() => {
    // 动态导入 zoomPlugin 只在客户端加载
    // import("chartjs-plugin-zoom").then((zoomPlugin) => {
    //   Chart.register(zoomPlugin.default);
    // });

    if (!isAuthenticating) {
      fetchData(); // 仅在 `isAuthenticating` 为 false 时发起请求
    }
  }, [isAuthenticated, isAuthenticating]);

  if (errorMessage) {
    return (
      <>
        <p>{errorMessage}</p>
        <Button onClick={fetchData}>重试</Button>
      </>
    );
  }

  // if (!data.assets.length) {
  //   return <Spinner />;
  // }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 h-full">
      <div className="flex justify-end gap-4">
        <LoginModal />
        <AddAmountModal onSuccess={fetchData} />
      </div>

      <Header data={data} rate={rate ?? 0} />
      <Chart data={data} />
    </div>
  );
};

export default AssetsPage;
