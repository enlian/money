"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import "chart.js/auto";
import { Chart } from "chart.js"; // 引入Chart.js的核心
import "./assets-page.css";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    spanGaps: boolean;
  }[];
}

const AssetsPage = () => {
  const [roiChartData, setROIChartData] = useState<ChartData | null>(null);
  const [assetsChartData, setAssetsChartData] = useState<ChartData | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 动态导入 zoomPlugin 只在客户端加载
    import('chartjs-plugin-zoom').then((zoomPlugin) => {
      Chart.register(zoomPlugin.default);
    });
    async function fetchData() {
      try {
        const response = await fetch("/api/assets");
        const data = await response.json();

        // 获取资产数据的日期和金额
        const labels = data.assets.map((item: { date: string }) =>
          moment(item.date).format("YY-MM-DD")
        );

        const amounts = data.assets.map(
          (item: { amount: number }) => item.amount
        );

        // 获取标普500、纳斯达克、比特币和以太坊的数据
        const sp500Amounts = data.sp500.map(
          (item: { amount: number }) => item.amount
        );
        const nasdaqAmounts = data.nasdaq.map(
          (item: { amount: number }) => item.amount
        );
        const btcAmounts = data.bitcoin.map(
          (item: { amount: number }) => item.amount
        );
        const ethAmounts = data.ethereum.map(
          (item: { amount: number }) => item.amount
        );

        // 设置ROI图表数据
        setROIChartData({
          labels,
          datasets: [
            {
              label: "资产投资回报率 (%)",
              data: normalizeData(amounts),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: false,
              spanGaps: false,
            },
            {
              label: "标普500投资回报率 (%)",
              data: normalizeData(sp500Amounts),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: false,
              spanGaps: false,
            },
            {
              label: "纳斯达克指数投资回报率 (%)",
              data: normalizeData(nasdaqAmounts),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: false,
              spanGaps: false,
            },
            {
              label: "BTC投资回报率 (%)",
              data: normalizeData(btcAmounts),
              borderColor: "rgba(255, 206, 86, 1)",
              backgroundColor: "rgba(255, 206, 86, 0.2)",
              fill: false,
              spanGaps: false,
            },
            {
              label: "ETH投资回报率 (%)",
              data: normalizeData(ethAmounts),
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              fill: false,
              spanGaps: false,
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
              spanGaps: false,
            },
          ],
        });
      } catch (error) {
        setErrorMessage("无法获取数据，请稍后重试: " + error);
      }
    }

    fetchData();
  }, []);

  // 标准化数据以百分比增长表示，第一个数据点设置为0
  const normalizeData = (data: number[]) => {
    const baseValue = data[0];
    return data.map((value, index) =>
      index === 0 ? 0 : Number(((value / baseValue - 1) * 100).toFixed(2))
    );
  };

  // 配置上图（投资回报率图表）的缩放选项
  const roiChartOptions = {
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as const, // 这里确保 mode 是 'x' 或 'y' 或 'xy'
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as const, // 这里确保 mode 是 'x' 或 'y' 或 'xy'
        },
        limits: {
          x: { min: "original" as const, max: "original" as const }, // 使用 'original' 作为限制
        },
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
      y: {
        // min: -50, // y轴最小值为-50
        max: 100, // 最大值为 300
        ticks: {
          // stepSize: 30, // 设置步长
        },
      },
    },
  };

  // 配置下图（资产金额图表）的选项
  const assetsChartOptions = {
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as const, // 这里确保 mode 是 'x' 或 'y' 或 'xy'
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as const, // 这里确保 mode 是 'x' 或 'y' 或 'xy'
        },
        limits: {
          x: { min: "original" as const, max: "original" as const }, // 使用 'original' 作为限制
        },
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
      <span>投资回报率对比图（自有资产、标普500、纳斯达克、BTC、ETH）</span>
      <div style={{ height: 400 }}>
        <Line data={roiChartData} options={roiChartOptions} />
      </div>
      <hr />
      <span>资产走势图</span>
      <div style={{ height: 400 }}>
        <Line data={assetsChartData} options={assetsChartOptions} />
      </div>
    </div>
  );
};

export default AssetsPage;
