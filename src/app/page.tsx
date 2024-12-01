"use client";

import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import moment from "moment";
import "chart.js/auto";
import { Chart, TooltipItem } from "chart.js"; // 引入Chart.js的核心
import "./assets-page.css";
import LoginModal from "./components/LoginModal";
import AddAmountModal from "./components/AddAmountModal";
import { useAuth } from "./context/AuthContext";

interface Dataset {
  label: string;
  data: number[];
  [key: string]: string | number | (number | null)[] | boolean | undefined; // 更宽泛但明确的类型
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface AssetData {
  [key: string]: number; // 定义对象的 key 是 string，值是 number
}

//计算1.3.5年的回报率
const getReturnrate = (data: AssetData[], range: number) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startYear = currentYear - (range - 1);
  const start = data.find(
    (item) => new Date(item.date) >= new Date(`${startYear}-01-01`)
  );
  const end = data
    .slice()
    .reverse()
    .find((item) => new Date(item.date) <= new Date(`${currentYear}-12-31`));

  const startAmount = start?.amount ?? 0;
  const endAmount = end?.amount ?? 0;
  return ((endAmount - startAmount) / startAmount) * 100;
};

// 创建一个通用的获取金额数组的方法
const getAmounts = (data: AssetData[], key: string) => {
  return data.map((item) => item[key]);
};

// 标准化数据以百分比增长表示，第一个数据点设置为0
const normalizeData = (data: number[]) => {
  const baseValue = data[0];
  return data.map((value, index) =>
    index === 0 ? 0 : Number(((value / baseValue - 1) * 100).toFixed(2))
  );
};

const AssetsPage = () => {
  const [roiChartData, setROIChartData] = useState<ChartData | null>(null);
  const [assetsChartData, setAssetsChartData] = useState<ChartData | null>(
    null
  );
  const [barChartData, setBarChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [latest, setLatest] = useState<number | null>(null); // 最新金额
  const [highPoint, setHighPoint] = useState<number | null>(null); // 高点金额
  const [drawdown, setDrawdown] = useState<number | null>(null); // 当前回撤百分比
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

      // 获取资产数据的日期和金额
      const labels = data.assets.map((item: { date: string }) =>
        moment(item.date).format("YY-MM-DD")
      );

      // 使用通用方法获取不同的数据集
      const amounts = getAmounts(data.assets, "amount");
      const sp500Amounts = getAmounts(data.sp500, "amount");
      const nasdaqAmounts = getAmounts(data.nasdaq, "amount");
      const btcAmounts = getAmounts(data.bitcoin, "amount");
      const ethAmounts = getAmounts(data.ethereum, "amount");

      //bar数据
      setBarChartData({
        labels: ["今年", "3年", "5年"],
        datasets: [
          {
            label: "自有资产",
            data: [
              getReturnrate(data.assets, 1),
              getReturnrate(data.assets, 3),
              getReturnrate(data.assets, 5),
            ],
            borderColor: "rgba(255, 0, 0, 1)",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
          },
        ],
      });

      // 设置ROI图表数据
      setROIChartData({
        labels,
        datasets: [
          {
            label: "自有资产",
            data: normalizeData(amounts),
            borderColor: "rgba(255, 0, 0, 1)", // 设置为显眼的红色
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            fill: false,
            spanGaps: false,
          },
          {
            label: "标普500",
            data: normalizeData(sp500Amounts),
            borderColor: "rgba(54, 162, 235, 0.8)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: false,
            spanGaps: false,
            hidden: false,
          },
          {
            label: "纳斯达克",
            data: normalizeData(nasdaqAmounts),
            borderColor: "rgba(144,156,255,0.8)",
            backgroundColor: "rgba(144,156,255,0.2)",
            fill: false,
            spanGaps: false,
          },
          {
            label: "BTC",
            data: normalizeData(btcAmounts),
            borderColor: "rgba(255, 206, 86, 0.8)",
            backgroundColor: "rgba(255, 206, 86, 0.2)",
            fill: false,
            spanGaps: false,
            hidden: true,
          },
          {
            label: "ETH",
            data: normalizeData(ethAmounts),
            borderColor: "rgba(95, 255, 113, 0.8)",
            backgroundColor: "rgba(95, 255, 113, 0.2)",
            fill: false,
            spanGaps: false,
            hidden: true,
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
            borderColor: "rgba(255, 0, 0, 0.4)", // 设置为显眼的红色
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            fill: true,
            spanGaps: false,
          },
        ],
      });

      // 计算并设置最新、高点和当前回撤
      const latestAmount = amounts[amounts.length - 1]; // 最新的金额
      const maxAmount = Math.max(...amounts); // 高点金额
      const currentDrawdown = ((maxAmount - latestAmount) / maxAmount) * 100; // 当前回撤

      setLatest(latestAmount);
      setHighPoint(maxAmount);
      setDrawdown(parseFloat(currentDrawdown.toFixed(2))); // 保留两位小数
    } catch (error) {
      setErrorMessage("无法获取数据，请稍后重试: " + error);
    }
  };

  useEffect(() => {
    // 动态导入 zoomPlugin 只在客户端加载
    import("chartjs-plugin-zoom").then((zoomPlugin) => {
      Chart.register(zoomPlugin.default);
    });

    if (!isAuthenticating) {
      fetchData(); // 仅在 `isAuthenticating` 为 false 时发起请求
    }
  }, [isAuthenticated, isAuthenticating]);

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
          mode: "x" as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as const,
        },
        limits: {
          x: { min: "original" as const, max: "original" as const },
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
        // max: 100,
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return value + "%"; // Append "%" for numbers
            }
            return value; // For string or other types, return the value as it is
          },
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
      title: {
        display: true,
        text: "投资走势图", // 图表标题
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (tooltipItem: TooltipItem<"line">) {
            const value = tooltipItem.raw as number; // 这里假设 raw 是数字类型
            return (
              tooltipItem.dataset.label +
              ": " +
              (value / 10000).toFixed(2) +
              "万"
            ); // 转换为“万”单位
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as const,
        },
        limits: {
          x: { min: "original" as const, max: "original" as const },
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
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return value / 10000 + "万"; // 将 y 轴数值除以 10000，并加上“万”单位
            }
            return value; // 如果 value 不是数字，直接返回
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // 禁用固定宽高比
    plugins: {
      title: {
        display: true,
        text: "投资回报率对比", // 图表标题
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"bar">) {
            const value = tooltipItem.raw as number; // 获取原始值
            return `${tooltipItem.dataset.label}: ${value.toFixed(2)}%`; // 格式化为百分比
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return `${value}%`; // 在纵坐标标签后加上百分号
            }
            return value;
          },
        },
        title: {
          display: true,
          text: "回报率 (%)", // 给纵坐标加上标题
        },
      },
      x: {
        title: {
          display: true,
          text: "时间范围", // 给横坐标加上标题
        },
      },
    },
  };

  if (errorMessage) {
    return (
      <div className="error-message">
        <p>{errorMessage}</p>
        <div className="retry-button" onClick={fetchData}>
          重试
        </div>
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
    <div className="chartPage">
      <div className="chart">
        {/* <Line data={roiChartData} options={roiChartOptions} /> */}
        <Bar data={barChartData} options={barChartOptions} />
      </div>
      <hr />
      {/* 显示最新、高点和当前回撤 */}
      <div className="right-info">
        <div>
          最新：{roiChartData?.labels[roiChartData.labels.length - 1]}
          {"  "}
          {latest ? (latest / 10000).toFixed(2) + "万" : ""}
        </div>
        <div>
          高点：{highPoint ? (highPoint / 10000).toFixed(2) + "万" : ""}{" "}
          {drawdown ? "当前回撤：" + drawdown + "%" : ""}
        </div>
      </div>
      <div className="chart">
        <Line data={assetsChartData} options={assetsChartOptions} />
      </div>

      <div className="bth-group">
        <AddAmountModal onSuccess={fetchData} />
        <LoginModal />
      </div>
    </div>
  );
};

export default AssetsPage;
