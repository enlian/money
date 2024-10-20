"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import "chart.js/auto";
import './assets-page.css';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: (number | null)[]; // 数据可以是数字或 null
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    spanGaps: boolean; // 添加 spanGaps 属性
  }[];
}

const AssetsPage = () => {
  const [roiChartData, setROIChartData] = useState<ChartData | null>(null);
  const [assetsChartData, setAssetsChartData] = useState<ChartData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/assets");
        const data = await response.json();

        // 获取资产数据的日期和金额
        const labels = data.assets.map((item: { date: string }) =>
          moment(item.date).format("YY-MM-DD")
        );

        const amounts = data.assets.map((item: { amount: number }) => item.amount);

        // 获取标普500和纳斯达克的数据
        const sp500Amounts = data.sp500.map((item: { amount: number }) => item.amount);
        const nasdaqAmounts = data.nasdaq.map((item: { amount: number }) => item.amount);

        // 设置ROI图表数据
        setROIChartData({
          labels,
          datasets: [
            {
              label: "资产投资回报率 (%)",
              data: normalizeData(amounts),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
              spanGaps: false, // 允许断层
            },
            {
              label: "标普500投资回报率 (%)",
              data: normalizeData(sp500Amounts),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: false,
              spanGaps: false, // 允许断层
            },
            {
              label: "纳斯达克指数投资回报率 (%)",
              data: normalizeData(nasdaqAmounts),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: false,
              spanGaps: false, // 允许断层
            },
          ],
        });

        // 设置资产金额图表数据
        setAssetsChartData({
          labels,
          datasets: [
            {
              label: "资产金额 (元)",
              data: amounts,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
              spanGaps: false, // 允许断层
            },
          ],
        });
      } catch (error) {
        setErrorMessage("无法获取数据，请稍后重试");
      }
    }

    fetchData();
  }, []);

  const normalizeData = (data: number[]) => {
    const baseValue = data[0];
    return data.map((value) => ((value / baseValue) * 100).toFixed(2)); // 标准化以100为基准
  };

  const chartOptions = {
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 30,
        },
      },
    },
  };

  if (errorMessage) {
    return (
      <div className="error-message">
        <p>{errorMessage}</p>
        <div className="retry-button">重试</div>
      </div>
    );
  }

  if (!roiChartData || !assetsChartData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <h3>投资回报率对比图（资产、标普500、纳斯达克）</h3>
      <div style={{ height: "400px" }}>
        <Line data={roiChartData} options={chartOptions} />
      </div>

      <h3>资产走势图</h3>
      <div style={{ height: "400px" }}>
        <Line data={assetsChartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AssetsPage;
