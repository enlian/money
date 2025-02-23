import { Chart as ChartJS, registerables, TooltipItem } from "chart.js";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import type { AllData, ChartData } from "../lib/types";
import {
  CHART_COLORS,
  getAmounts,
  getReturnrate,
  transparentize,
} from "../lib/utils";

interface ChartProps {
  data: AllData | null;
}

export default function Charts({ data }: ChartProps) {
  const [assetsChartData, setAssetsChartData] = useState<ChartData | null>(
    null
  );
  const [barChartData, setBarChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  const labels = useMemo(() => {
    return (
      data?.assets.map((item: { date: string }) =>
        moment(item.date).format("YY-MM-DD")
      ) ?? []
    );
  }, [data]);

  const amounts = useMemo(() => {
    return data ? getAmounts(data.assets, "amount") : [];
  }, [data]);

  useEffect(() => {
    if (!data) return;
    // 动态导入 zoomPlugin 只在客户端加载
    import("chartjs-plugin-zoom").then((zoomPlugin) => {
      ChartJS.register(...registerables, zoomPlugin.default);
    });
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
  }, [data]);

  useEffect(() => {
    if (!data) return;

    setAssetsChartData({
      labels: labels ?? [],
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
  }, [labels, amounts]);

  // 投资回报率 bar 图选项
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "投资回报率对比",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"bar">) {
            const value = tooltipItem.raw as number;
            return `${tooltipItem.dataset.label}: ${value.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return `${value}%`;
            }
            return value;
          },
        },
        title: {
          display: true,
          text: "回报率 (%)",
        },
      },
      x: {
        title: {
          display: true,
          text: "时间范围",
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
        text: "总资产走势图",
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (tooltipItem: TooltipItem<"line">) {
            const value = tooltipItem.raw as number;
            return `${tooltipItem.dataset.label}: ${(value / 10000).toFixed(
              2
            )}万`;
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
              return value / 10000 + "万";
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <>
      <div className="h-[350px]">
        <Bar data={barChartData} options={barChartOptions} />
      </div>

      <div className="h-[350px]">
        {assetsChartData && (
          <Line data={assetsChartData} options={assetsChartOptions} />
        )}
      </div>
    </>
  );
}
