"use client";

import AddAmountModal from "@/components/add-amount-modal";
import Charts from "@/components/charts";
import Error from "@/components/error";
import HeaderInfo from "@/components/header-info";
import LoginModal from "@/components/login-modal";
import Spinner from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import "chart.js/auto";
import { useSession } from "next-auth/react";
import type { AllData } from "./lib/types";

const fetchAssets = async () => {
  const response = await fetch("/api/assets", {
    method: "POST",
  });
  return response.json();
};

const Page = () => {
  const { data: session, status } = useSession();

  const { data, error, isLoading, refetch } = useQuery<AllData>({
    queryKey: ["assets", session?.user?.name], // 缓存键
    queryFn: fetchAssets,
    //enabled: status === "authenticated", // 只有在认证完成后才请求数据
    staleTime: 1000 * 60 * 5, // 5分钟内不重新获取数据
    retry: 2, // 失败时自动重试 2 次
  });

  if (status === "loading" || isLoading) {
    return <Spinner />;
  }

  if (error || !data?.assets?.length) {
    return (
      <Error
        errorMessage={error?.message || "暂无数据，请重试"}
        fetchData={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 h-full w-[550px]">
      <div className="flex justify-end gap-3">
        <AddAmountModal onSuccess={refetch} />
        <LoginModal />
      </div>

      <HeaderInfo data={data} rate={data.exchangeRate} />
      <Charts data={data} />
    </div>
  );
};

export default Page;
