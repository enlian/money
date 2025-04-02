import { getServerSession } from "next-auth";
import yahooFinance from "yahoo-finance2";
import { getVisitorData } from "../../lib/api-utils";
import { query } from "../../lib/db";
import { formatTimestamps, getExchangeRate } from "../../lib/utils";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      const visitorData = await getVisitorData();
      return new Response(JSON.stringify(visitorData), {
        status: 200,
      });
    }

    // 用户已认证，直接查询数据库
    const result = await query(`
      SELECT TO_CHAR(TO_TIMESTAMP(date), 'YYYY-MM-DD') AS date, amount 
      FROM assets 
      ORDER BY date ASC
    `);

    const earliestDate = result.rows[0]?.date;
    const latestDate =
      result.rows[result.rows.length - 1]?.date ||
      new Date().toISOString().split("T")[0];

    const SPYData = await yahooFinance.chart("SPY", {
      period1: earliestDate,
      period2: latestDate,
      interval: "1d",
    });

    const QQQData = await yahooFinance.chart("QQQ", {
      period1: earliestDate,
      period2: latestDate,
      interval: "1d",
    });

    const btcData = await yahooFinance.chart("BTC-USD", {
      period1: earliestDate,
      period2: latestDate,
      interval: "1d",
    });

    const ethData = await yahooFinance.chart("ETH-USD", {
      period1: earliestDate,
      period2: latestDate,
      interval: "1d",
    });

    const exchangeRate = await getExchangeRate();

    const responseData = {
      assets: result.rows,
      SPY: formatTimestamps(SPYData.quotes),
      QQQ: formatTimestamps(QQQData.quotes),
      bitcoin: formatTimestamps(btcData.quotes),
      ethereum: formatTimestamps(ethData.quotes),
      exchangeRate: exchangeRate,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "获取数据失败" }), {
      status: 500,
    });
  }
}
