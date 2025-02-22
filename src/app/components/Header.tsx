import React, { useState, useEffect, useMemo } from "react";

interface Dataset {
  label: string;
  data: number[];
  [key: string]: string | number | (number | null)[] | boolean | undefined;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface HeaderProps {
  assetsChartData: ChartData | null;
  rate: number | null;
  amounts: number[];
}

/**
 * @page 最新、高点和当前回撤
 */
const Header = React.memo(({ assetsChartData, rate, amounts }: HeaderProps) => {
  const [latest, setLatest] = useState<number | null>(null);
  const [highPoint, setHighPoint] = useState<number | null>(null);
  const [drawdown, setDrawdown] = useState<number | null>(null);

  // ✅ 使用 `useMemo` 计算值，只在 `amounts` 变化时重新计算
  const { latestAmount, maxAmount, currentDrawdown } = useMemo(() => {
    if (amounts.length === 0)
      return { latestAmount: null, maxAmount: null, currentDrawdown: null };

    const latestAmount = amounts[amounts.length - 1]; // 最新的金额
    const maxAmount = Math.max(...amounts); // 最高金额
    const currentDrawdown = ((maxAmount - latestAmount) / maxAmount) * 100; // 当前回撤

    return {
      latestAmount,
      maxAmount,
      currentDrawdown: parseFloat(currentDrawdown.toFixed(2)),
    };
  }, [amounts]);

  // ✅ 只有在 `amounts` 变化时更新 `state`
  useEffect(() => {
    setLatest(latestAmount);
    setHighPoint(maxAmount);
    setDrawdown(currentDrawdown);
  }, [latestAmount, maxAmount, currentDrawdown]);

  return (
    <div className="p-4 bg-white shadow-sm rounded-lg">
      <p className="text-gray-700">
        {assetsChartData?.labels[assetsChartData.labels.length - 1]}：
        {latest ? (latest / 10000).toFixed(2) + "万" : ""}{" "}
        {latest && rate
          ? `/ ${(latest / rate / 10000).toFixed(2)}万 (美元${rate})`
          : ""}
      </p>

      <p className="text-gray-600">
        最高 {highPoint ? (highPoint / 10000).toFixed(2) + "万" : ""}{" "}
        <span className="text-red-900">-{drawdown}%</span>
      </p>
    </div>
  );
});

export default Header;
