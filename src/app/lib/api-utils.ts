import yahooFinance from "yahoo-finance2";
import { formatTimestamps, getExchangeRate } from "./utils";

export async function getVisitorData() {
  // 统一设置日期范围为 2022 年底到当前最新日期
  const startDate = "2022-12-31";
  const endDate = new Date().toISOString().split("T")[0]; // 当前日期
  const exchangeRate = await getExchangeRate(); // 获取汇率

  // 获取道琼斯指数数据
  const dowJonesData = await yahooFinance.chart("^DJI", {
    period1: startDate,
    period2: endDate,
    interval: "1d", // 每日数据
  });

  // 获取标普500数据
  const SPYData = await yahooFinance.chart("SPY", {
    period1: startDate,
    period2: endDate,
    interval: "1d", // 每日数据
  });

  // 获取纳斯达克数据
  const QQQData = await yahooFinance.chart("QQQ", {
    period1: startDate,
    period2: endDate,
    interval: "1d", // 每日数据
  });

  // 获取比特币数据
  const btcData = await yahooFinance.chart("BTC-USD", {
    period1: startDate,
    period2: endDate,
    interval: "1d", // 每日数据
  });

  // 获取以太坊数据
  const ethData = await yahooFinance.chart("ETH-USD", {
    period1: startDate,
    period2: endDate,
    interval: "1d", // 每日数据
  });

  // 组合外部 API 数据
  const responseData = {
    assets: formatTimestamps(dowJonesData.quotes), // 道琼斯指数数据
    SPY: formatTimestamps(SPYData.quotes), // 标普500数据
    QQQ: formatTimestamps(QQQData.quotes), // 纳斯达克数据
    btc: formatTimestamps(btcData.quotes), // 比特币数据
    eth: formatTimestamps(ethData.quotes), // 以太坊数据
    exchangeRate: exchangeRate,
  };

  return responseData;
}
