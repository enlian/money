import colorLib from "@kurkle/color";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AssetData } from "../lib/types";

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY; // 获取汇率

export function transparentize(value: string, opacity?: number): string {
  const alpha = opacity !== undefined ? opacity : 0.5;
  return colorLib(value).alpha(alpha).rgbString();
}

const COLORS = [
  "#4dc9f6",
  "#f67019",
  "#f53794",
  "#537bc4",
  "#acc236",
  "#166a8f",
  "#00a950",
  "#58595b",
  "#8549ba",
];

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export function color(index: number): string {
  return COLORS[index % COLORS.length];
}

// 计算平均年化收益率（Compound Annual Growth Rate）
export const getAnnualizedReturnRate = (data: AssetData[]) => {
  if (data.length < 2) return 0;

  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const start = sorted[0];
  const end = sorted[sorted.length - 1];

  if (start.amount == null || end.amount == null) return 0;

  const startAmount = start.amount as number;
  const endAmount = end.amount as number;

  const startDate = new Date(start.date);
  const endDate = new Date(end.date);

  const years =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (years <= 0) return 0;

  const cagr = Math.pow(endAmount / startAmount, 1 / years) - 1;
  return +(cagr * 100).toFixed(2) + "%"; // 转换为百分比格式
};

// 获取外部API的汇率数据
export const getExchangeRate = async () => {
  const usdUrl = "https://wise.com/rates/live?source=USD&target=CNY";
  const gbpUrl = "https://wise.com/rates/live?source=GBP&target=CNY";

  const [usdRes, gbpRes] = await Promise.all([fetch(usdUrl), fetch(gbpUrl)]);

  const [usdData, gbpData] = await Promise.all([usdRes.json(), gbpRes.json()]);

  return {
    usd: parseFloat(usdData.value.toFixed(2)),
    gbp: parseFloat(gbpData.value.toFixed(2)),
  };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 通用的获取金额数组的方法
export const getAmounts = (data: AssetData[], key: string) => {
  return data
    .map((item) => item[key])
    .filter((value) => typeof value === "number") as number[];
};

//计算1.3.5年的回报率
export const getReturnrate = (data: AssetData[], range: number) => {
  const now = new Date();
  let startDate: Date;

  if (range === 1) {
    startDate = new Date(now.getFullYear(), 0, 1); // 今年年初
  } else {
    startDate = new Date();
    startDate.setFullYear(now.getFullYear() - range);
  }

  const start = data.find((item) => new Date(item.date) >= startDate);
  const end = [...data].reverse().find((item) => new Date(item.date) <= now);

  if (!start || !end || !start.amount || !end.amount) return 0;

  return (
    (((end.amount as number) - (start.amount as number)) /
      (start.amount as number)) *
    100
  );
};

export const formatTimestamps = (
  dataArray: { date: Date; close: number | null }[]
) => {
  return dataArray.map((item) => {
    return {
      date: item.date, // 使用返回的数据中的日期
      amount: item.close, // 收盘价作为金额
    };
  });
};
