import colorLib from "@kurkle/color";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function color(index: number): string {
  return COLORS[index % COLORS.length];
}

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

// 获取外部API的汇率数据
export const getExchangeRate = async () => {
  //const url = `https://data.fixer.io/api/latest?access_key=${EXCHANGE_RATE_API_KEY}`;
  const url = `https://wise.com/rates/live?source=USD&target=CNY`;
  const response = await fetch(url);
  const data = await response.json();
  // 计算 USD/CNY 汇率
  // const usdToCny = data.rates.CNY / data.rates.USD;

  return data.value.toFixed(2);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
