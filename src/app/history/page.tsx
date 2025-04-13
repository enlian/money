"use client";

import Error from "@/components/error";
import LoginModal from "@/components/login-modal";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type AssetRow = {
  date: string;
  纳斯达克?: number;
  标普500?: number;
  比特币?: number;
  以太坊?: number;
};

const fetchAssets = async () => {
  const response = await fetch("/api/history", {
    method: "POST",
  });
  return response.json() as Promise<AssetRow[]>;
};

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data, error, isLoading, refetch } = useQuery<AssetRow[]>({
    queryKey: ["history", session?.user?.name],
    queryFn: fetchAssets,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const exportToExcel = () => {
    if (!data) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "资产历史数据");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "资产历史数据.xlsx");
  };

  if (status === "loading" || isLoading) {
    return <Spinner />;
  }

  if (error || !data) {
    return (
      <Error
        errorMessage={error?.message || "暂无数据，请重试"}
        fetchData={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-white h-full">
      <div className="flex justify-end gap-3">
        <Button onClick={() => router.push("/")}>首页</Button>

        <Button onClick={exportToExcel}>导出</Button>
        <LoginModal />
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b font-semibold">
            <tr>
              <th className="px-4 py-2">date</th>
              <th className="px-4 py-2">纳斯达克</th>
              <th className="px-4 py-2">标普500</th>
              <th className="px-4 py-2">比特币</th>
              <th className="px-4 py-2">以太坊</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.纳斯达克?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2">{row.标普500?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2">{row.比特币?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2">{row.以太坊?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
