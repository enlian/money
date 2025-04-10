export interface AllData {
  assets: AssetData[];
  SPY: AssetData[];
  QQQ: AssetData[];
  btc: AssetData[];
  exchangeRate: number | 7.25;
}

export interface Dataset {
  label: string;
  data: number[];
  [key: string]: string | number | (number | null)[] | boolean | undefined;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface AssetData {
  date: string;
  [key: string]: number | string;
}
