"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

// Define the state type for chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

const AssetsPage = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // 帮助函数：将 Unix 时间戳转换为 'YYYY-MM-DD' 格式
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // 将秒转换为毫秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份是从 0 开始计数的
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/assets"); // 调用 API 获取数据
      const data = await response.json();

      const labels = data.map((item: { date: number; amount: number }) =>
        formatDate(item.date)
      ); // 将时间戳格式化为日期
      const amounts = data.map(
        (item: { date: number; amount: number }) => item.amount
      ); // 获取金额数据

      // 设置图表数据
      setChartData({
        labels,
        datasets: [
          {
            label: "资产金额",
            data: amounts,
            borderColor: "rgba(75, 192, 192, 1)", // 线条颜色
            backgroundColor: "rgba(75, 192, 192, 0.2)", // 填充背景颜色
            fill: true, // 是否填充线条下方区域
          },
        ],
      });
    }

    fetchData(); // 执行数据获取
  }, []);

  if (!chartData) return <div>加载中...</div>; // 数据未加载时显示加载状态

  // 定义图表选项，并使用正确的 interaction.mode 类型
  const chartOptions = {
    interaction: {
      mode: "index" as const, // 使用允许的值，如 'index' 或 'nearest'
      intersect: false, // 布尔值
    },
    plugins: {
      tooltip: {
        mode: "index" as const, // 在这里也使用 'index' 或 'nearest'
        intersect: false, // 布尔值
      },
    },
    responsive: true, // 使图表响应式
    maintainAspectRatio: false, // 是否保持宽高比
  };

  return (
    <div>
      <h1>资产趋势图</h1>
      <div style={{ height: "400px" }}>
        {/* 渲染折线图 */}
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AssetsPage;
