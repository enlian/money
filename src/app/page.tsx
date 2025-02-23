"use client";

import Spinner from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import "chart.js/auto";
import AddAmountModal from "./components/add-amount-modal";
import Charts from "./components/charts";
import Error from "./components/error";
import Header from "./components/header-info";
import LoginModal from "./components/login-modal";
import { useAuth } from "./context/AuthContext";
import type { AllData } from "./lib/types";

const fetchAssets = async (token: string | null) => {
  const response = await fetch("/api/assets", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return response.json();
};

const Page = () => {
  const { isAuthenticated, isAuthenticating, token } = useAuth();

  // 使用 react-query 进行数据请求
  const { data, error, isLoading, refetch } = useQuery<AllData>({
    queryKey: ["assets", isAuthenticated, token], // 缓存键
    queryFn: () => fetchAssets(token),
    enabled: !isAuthenticating, // 只有在认证完成后才请求数据
    staleTime: 1000 * 60 * 5, // 5分钟内不重新获取数据
    retry: 2, // 失败时自动重试 2 次
  });

  if (error) {
    return <Error errorMessage={error.message} fetchData={refetch} />;
  }

  if (isLoading || !data?.assets?.length) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 h-full max-w-3xl">
      <div className="flex justify-end gap-3">
        <AddAmountModal onSuccess={refetch} />
        <LoginModal />
      </div>

      <Header data={data} rate={data.exchangeRate} />
      <Charts data={data} />
    </div>
  );
};

export default Page;
