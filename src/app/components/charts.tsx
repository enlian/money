"use client";

import { Button } from "@/components/ui/button";
import { Chart as ChartJS, registerables, TooltipItem } from "chart.js";
import "chartjs-adapter-moment";
import zoomPlugin from "chartjs-plugin-zoom";
import moment from "moment";
import "moment/locale/zh-cn";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import type { AllData, ChartData } from "../lib/types";
import {
  CHART_COLORS,
  getAmounts,
  getReturnrate,
  transparentize,
} from "../lib/utils";

moment.locale("zh-cn");
ChartJS.register(...registerables, zoomPlugin);

interface ChartProps {
  data: AllData | null;
}

// 缩放按钮配置
const ZOOM_OPTIONS = [
  { label: "今年", key: "year" },
  { label: "近一年", key: "1y" },
  { label: "近三年", key: "3y" },
  { label: "近五年", key: "5y" },
  { label: "全部", key: "all" },
] as const;

type ZoomKey = (typeof ZOOM_OPTIONS)[number]["key"];

export default function Charts({ data }: ChartProps) {
  const [assetsChartData, setAssetsChartData] = useState<ChartData | null>(
    null
  );
  const [barChartData, setBarChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  const [activeZoom, setActiveZoom] = useState<ZoomKey>("1y");
  const lineChartRef = useRef<ChartJS<"line"> | null>(null);

  const labels = useMemo(() => {
    return data?.assets.map((item: { date: string }) => item.date) ?? [];
  }, [data]);

  const amounts = useMemo(() => {
    return data ? getAmounts(data.assets, "amount") : [];
  }, [data]);

  useEffect(() => {
    if (!data) return;

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
          borderColor: CHART_COLORS.blue,
          backgroundColor: transparentize(CHART_COLORS.blue, 0.5),
        },
        {
          label: "SPY",
          data: [
            getReturnrate(data.SPY, 1),
            getReturnrate(data.SPY, 3),
            getReturnrate(data.SPY, 5),
          ],
          borderColor: CHART_COLORS.grey,
          backgroundColor: transparentize(CHART_COLORS.grey, 0.8),
        },
        {
          label: "QQQ",
          data: [
            getReturnrate(data.QQQ, 1),
            getReturnrate(data.QQQ, 3),
            getReturnrate(data.QQQ, 5),
          ],
          borderColor: CHART_COLORS.green,
          backgroundColor: transparentize(CHART_COLORS.green, 0.5),
          hidden: true,
        },
        {
          label: "BTC",
          data: [
            getReturnrate(data.btc, 1),
            getReturnrate(data.btc, 3),
            getReturnrate(data.btc, 5),
          ],
          borderColor: CHART_COLORS.yellow,
          backgroundColor: transparentize(CHART_COLORS.yellow, 0.6),
          hidden: true,
        },
      ],
    });
  }, [data]);

  useEffect(() => {
    if (!data) return;

    setAssetsChartData({
      labels,
      datasets: [
        {
          label: "资产金额 (元)",
          data: amounts,
          borderColor: transparentize(CHART_COLORS.blue, 0),
          backgroundColor: transparentize(CHART_COLORS.blue, 0.3),
          fill: true,
          spanGaps: true,
          cubicInterpolationMode: "monotone",
          tension: 1,
        },
      ],
    });
  }, [labels, amounts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      zoomTo("1y");
    }, 100);
    return () => clearTimeout(timeout);
  }, [assetsChartData]);

  // 通用缩放函数
  const zoomTo = (key: ZoomKey) => {
    if (!lineChartRef.current) return;
    const chart = lineChartRef.current;

    setActiveZoom(key);

    setTimeout(() => {
      if (key === "year") {
        const start = moment().startOf("year");
        const end = moment().endOf("year");
        chart.zoomScale("x", { min: start.valueOf(), max: end.valueOf() });
      } else if (["1y", "3y", "5y"].includes(key)) {
        const years = parseInt(key[0]);
        const start = moment().subtract(years, "year").startOf("day");
        const end = moment().endOf("day");
        chart.zoomScale("x", { min: start.valueOf(), max: end.valueOf() });
      } else if (key === "all") {
        chart.resetZoom();
      }
    }, 100);
  };

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
          callback: (value: number | string) =>
            typeof value === "number" ? `${value}%` : value,
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

  const assetsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x" as const,
        },
        limits: {
          x: { min: "original" as const, max: "original" as const },
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "month" as const,
          displayFormats: {
            month: "YY/M/D",
          },
          tooltipFormat: "YYYY/MM/DD",
        },
        ticks: {
          maxTicksLimit: 30,
        },
      },
      y: {
        ticks: {
          callback: (value: string | number) =>
            typeof value === "number" ? value / 10000 + "万" : value,
        },
      },
    },
  };

  return (
    <>
      <div className="h-[350px] mb-5 relative">
        <div className="space-x-3 flex justify-end absolute right-0 top-5">
          {ZOOM_OPTIONS.map(({ label, key }) => (
            <Button
              key={key}
              onClick={() => zoomTo(key)}
              variant={activeZoom === key ? "secondary" : "default"}
            >
              {label}
            </Button>
          ))}
        </div>
        {assetsChartData && (
          <Line
            ref={lineChartRef}
            data={assetsChartData}
            options={assetsChartOptions}
          />
        )}
      </div>

      <div className="h-[350px]">
        <Bar data={barChartData} options={barChartOptions} />
      </div>
    </>
  );
}
