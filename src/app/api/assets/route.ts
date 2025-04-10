import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import yahooFinance from "yahoo-finance2";
import { getVisitorData } from "../../lib/api-utils";
import { query } from "../../lib/db";
import { formatTimestamps, getExchangeRate } from "../../lib/utils";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      const visitorData = await getVisitorData();
      return new Response(JSON.stringify(visitorData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await query(`
      SELECT date, amount
      FROM assets 
      ORDER BY date ASC
    `);

    const earliestDate = result.rows[0].date;
    const latestDate = result.rows[result.rows.length - 1].date;

    const [SPYData, QQQData, btcData, ethData, exchangeRate] =
      await Promise.all([
        yahooFinance.chart("SPY", {
          period1: earliestDate,
          period2: latestDate,
          interval: "1d",
        }),
        yahooFinance.chart("QQQ", {
          period1: earliestDate,
          period2: latestDate,
          interval: "1d",
        }),
        yahooFinance.chart("BTC-USD", {
          period1: earliestDate,
          period2: latestDate,
          interval: "1d",
        }),
        yahooFinance.chart("ETH-USD", {
          period1: earliestDate,
          period2: latestDate,
          interval: "1d",
        }),
        getExchangeRate(),
      ]);

    const responseData = {
      assets: result.rows,
      SPY: formatTimestamps(SPYData.quotes),
      QQQ: formatTimestamps(QQQData.quotes),
      btc: formatTimestamps(btcData.quotes),
      eth: formatTimestamps(ethData.quotes),
      exchangeRate,
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
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "获取数据失败" }), {
      status: 500,
    });
  }
}
