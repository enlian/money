import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import type { AssetData, AllData } from "../lib/types";
import { getAmounts } from "../lib/utils";

interface Props {
  data: AllData | null;
  rate: number | 0;
}

/**
 * @page 最新、高点和当前回撤
 */
const Header = React.memo(({ data, rate }: Props) => {
  const [latest, setLatest] = useState<number | null>(null);
  const [highPoint, setHighPoint] = useState<number | null>(null);
  const [drawdown, setDrawdown] = useState<number | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(null);

  const { latestAmount, maxAmount, currentDrawdown, latestFormattedDate } =
    useMemo(() => {
      const amounts = data ? getAmounts(data.assets, "amount") : [];

      if (amounts.length === 0)
        return {
          latestAmount: null,
          maxAmount: null,
          currentDrawdown: null,
          latestFormattedDate: null,
        };

      const latestAmount = amounts[amounts.length - 1]; // 最新金额
      const maxAmount = Math.max(...amounts); // 最高金额
      const currentDrawdown = ((maxAmount - latestAmount) / maxAmount) * 100; // 当前回撤
      const latestFormattedDate = moment(
        data?.assets[data.assets.length - 1]?.date
      ).format("YYYY/MM/DD");

      return {
        latestAmount,
        maxAmount,
        currentDrawdown: parseFloat(currentDrawdown.toFixed(2)),
        latestFormattedDate,
      };
    }, [data?.assets]);

  useEffect(() => {
    setLatest(latestAmount);
    setHighPoint(maxAmount);
    setDrawdown(currentDrawdown);
    setLatestDate(latestFormattedDate);
  }, [latestAmount, maxAmount, currentDrawdown, latestFormattedDate]);

  return (
    <div className="p-4 bg-white shadow-sm rounded-lg">
      <p className="text-gray-700">
        {latestDate} - {latest ? (latest / 10000).toFixed(2) + "万" : ""}{" "}
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
