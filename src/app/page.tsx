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
import { CHART_COLORS, transparentize } from "././lib/utils.js";
import Header from './components/Header';

interface Dataset {
  label: string;
  data: number[];
  [key: string]: string | number | (number | null)[] | boolean | undefined; 
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface AssetData {
  [key: string]: number; 
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

  console.log(start, end);

  const startAmount = start?.amount ?? 0;
  const endAmount = end?.amount ?? 0;
  return ((endAmount - startAmount) / startAmount) * 100;
};

// 通用的获取金额数组的方法
const getAmounts = (data: AssetData[], key: string) => {
  return data.map((item) => item[key]);
};

const AssetsPage = () => {
  const [assetsChartData, setAssetsChartData] = useState<ChartData | null>(
    null
  );
  const [barChartData, setBarChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [rate, setRate] = useState<number | null>(null);
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

      setRate(data.exchangeRate); //设置汇率

      // 使用通用方法获取不同的数据集
      const amounts = getAmounts(data.assets, "amount");
      const sp500Amounts = getAmounts(data.sp500, "amount");
      const nasdaqAmounts = getAmounts(data.nasdaq, "amount");
      const btcAmounts = getAmounts(data.bitcoin, "amount");
      const ethAmounts = getAmounts(data.ethereum, "amount");

      //投资回报率bar图数据
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
            borderColor: CHART_COLORS.red,
            backgroundColor: transparentize(CHART_COLORS.red, 0.5),
          },
          {
            label: "spx500",
            data: [
              getReturnrate(data.sp500, 1),
              getReturnrate(data.sp500, 3),
              getReturnrate(data.sp500, 5),
            ],
            borderColor: CHART_COLORS.blue,
            backgroundColor: transparentize(CHART_COLORS.blue, 0.5),
          },
          {
            label: "Nasdaq",
            data: [
              getReturnrate(data.nasdaq, 1),
              getReturnrate(data.nasdaq, 3),
              getReturnrate(data.nasdaq, 5),
            ],
            borderColor: CHART_COLORS.green,
            backgroundColor: transparentize(CHART_COLORS.green, 0.5),
          },
          {
            label: "BTC",
            data: [
              getReturnrate(data.bitcoin, 1),
              getReturnrate(data.bitcoin, 3),
              getReturnrate(data.bitcoin, 5),
            ],
            borderColor: CHART_COLORS.yellow,
            backgroundColor: transparentize(CHART_COLORS.yellow, 0.5),
            hidden: true,
          },
        ],
      });

      // 总资产走势图表数据
      setAssetsChartData({
        labels,
        datasets: [
          {
            label: "资产金额 (元)",
            data: amounts,
            borderColor: transparentize(CHART_COLORS.red, 0),
            backgroundColor: transparentize(CHART_COLORS.red, 0.1),
            fill: true,
            spanGaps: false,
            cubicInterpolationMode: "monotone",
            tension: 1,
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

  //投资回报率bar图选项
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

  // 总资产走势图选项
  const assetsChartOptions = {
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "总资产走势图", // 图表标题
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

  useEffect(() => {
    // 动态导入 zoomPlugin 只在客户端加载
    import("chartjs-plugin-zoom").then((zoomPlugin) => {
      Chart.register(zoomPlugin.default);
    });

    if (!isAuthenticating) {
      fetchData(); // 仅在 `isAuthenticating` 为 false 时发起请求
    }
  }, [isAuthenticated, isAuthenticating]);

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

  if (!barChartData || !assetsChartData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="chartPage">
      <Header 
        assetsChartData={assetsChartData}
        latest={latest}
        highPoint={highPoint}
        drawdown={drawdown}
        rate={rate}
      />
      <div className="chart">
        <Bar data={barChartData} options={barChartOptions} />
      </div>
      <hr />
      
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
