import React from 'react'

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
  latest: number | null;
  highPoint: number | null;
  drawdown: number | null;
  rate: number | null;
}

/**
 * @page 最新、高点和当前回撤
 */
export default function Header({ assetsChartData, latest, highPoint, drawdown, rate }: HeaderProps): JSX.Element {
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="text-lg font-semibold text-gray-700">
        最新：{assetsChartData?.labels[assetsChartData.labels.length - 1]}
        {"  "}
        {latest ? (latest / 10000).toFixed(2) + "万" : ""}
      </div>
      <div className="text-lg text-gray-600">
        高点：{highPoint ? (highPoint / 10000).toFixed(2) + "万" : ""} {" "}
        {drawdown ? <span className="text-red-500">当前回撤：{drawdown}%</span> : ""}
      </div>
      {rate && latest ? (
        <div className="text-lg text-gray-600">
          美元汇率：{rate} 美元总额：<span className="font-semibold">{((latest / rate) / 10000).toFixed(2) + "万"}</span>
        </div>
      ) : null}
    </div>
  )
}
