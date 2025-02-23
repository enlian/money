export interface AllData {
  assets: AssetData[];
  sp500: AssetData[];
  nasdaq: AssetData[];
  bitcoin: AssetData[];
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
