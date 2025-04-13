import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import yahooFinance from "yahoo-finance2";
import { getVisitorData } from "../../lib/api-utils";
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

    const symbols = [
      { key: "标普500", symbol: "^GSPC" },
      { key: "纳斯达克", symbol: "^IXIC" },
      { key: "比特币", symbol: "BTC-USD" },
      { key: "以太坊", symbol: "ETH-USD" },
    ];

    const earliest = new Date("1900-01-01");
    const latest = Date.now();

    const results = await Promise.all(
      symbols.map(({ symbol }) =>
        yahooFinance.chart(symbol, {
          period1: earliest,
          period2: latest,
          interval: "1d",
        })
      )
    );

    const dateMap = new Map<string, any>();

    results.forEach((res, i) => {
      const key = symbols[i].key;
      res.quotes.forEach(({ date, close }: any) => {
        const d = new Date(date).toISOString().slice(0, 10);
        if (!dateMap.has(d)) dateMap.set(d, { date: d });
        dateMap.get(d)[key] = close;
      });
    });

    const merged = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return new Response(JSON.stringify(merged), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
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
