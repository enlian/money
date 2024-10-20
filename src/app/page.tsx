"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import "chart.js/auto";

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

  const formatDate = (timestamp: number): string => {
    return moment(timestamp * 1000).format("YY-MM-D"); // 使用 moment.js 格式化日期
  };

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/assets");
      const data = await response.json();

      const labels = data.map((item: { date: number; amount: number }) =>
        formatDate(item.date)
      );
      const amounts = data.map(
        (item: { date: number; amount: number }) => item.amount
      );

      setChartData({
        labels,
        datasets: [
          {
            label: "资产金额",
            data: amounts,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
          },
        ],
      });
    }

    fetchData();
  }, []);

  if (!chartData) return <div>加载中...</div>;

  const chartOptions = {
    interaction: {
      mode: "index" as const, // 鼠标移动时，显示该点所在 x 轴上的所有数据集。其他可选值：'nearest'，'dataset'，'point'，'x'，'y' 等。
      intersect: false, // 当设置为 false 时，鼠标不需要精确悬停在数据点上就能触发交互（如工具提示）。
    },
    plugins: {
      tooltip: {
        mode: "index" as const, // 工具提示显示 x 轴上的所有数据点（即每个数据集在该 x 轴值上的所有数据）。
        intersect: false, // 当设置为 false 时，鼠标不需要精确悬停在数据点上就能显示工具提示。
      },
    },
    responsive: true, // 图表是否响应式。如果为 true，图表会根据容器大小自动调整。
    maintainAspectRatio: false, // 是否保持宽高比。false 表示图表的高度和宽度可以根据容器进行独立调整。
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 30, // 设置 x 轴最多显示的标签数量（控制标签的密集度）。如果数据较多，超过此值的标签将被隐藏。
        },
      },
    },
  };
  

  return (
    <div>
      <h1>资产趋势图</h1>
      <div style={{ height: "400px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AssetsPage;
