import { query } from './../../lib/db';
import yahooFinance from 'yahoo-finance2'; // 使用 yahoo-finance2 库

// 通用的时间戳格式化方法
const formatTimestamps = (dataArray) => {
  return dataArray.map((item) => {
    return {
      date: item.date, // 使用返回的数据中的日期
      amount: item.close // 收盘价作为金额
    };
  });
};

export async function GET() {
  try {
    // 从 PostgreSQL 数据库中获取资产数据，并将日期格式化为 'YYYY-MM-DD'
    const result = await query(`
      SELECT TO_CHAR(TO_TIMESTAMP(date), 'YYYY-MM-DD') AS date, amount 
      FROM assets 
      ORDER BY date ASC
    `);

    const earliestDate = result.rows[0]?.date; // 使用资产数据的最早日期
    const latestDate = result.rows[result.rows.length - 1]?.date || new Date().toISOString().split('T')[0];

    // 获取标普500数据
    const sp500Data = await yahooFinance.chart('SPY', {
      period1: earliestDate,
      period2: latestDate,
      interval: '1d', // 每日数据
    });

    // 获取纳斯达克数据
    const nasdaqData = await yahooFinance.chart('QQQ', {
      period1: earliestDate,
      period2: latestDate,
      interval: '1d', // 每日数据
    });

    // 获取比特币数据
    const btcData = await yahooFinance.chart('BTC-USD', {
      period1: earliestDate,
      period2: latestDate,
      interval: '1d', // 每日数据
    });

    // 获取以太坊数据
    const ethData = await yahooFinance.chart('ETH-USD', {
      period1: earliestDate,
      period2: latestDate,
      interval: '1d', // 每日数据
    });

    // 组合数据库数据与外部API数据
    const responseData = {
      assets: result.rows,
      sp500: formatTimestamps(sp500Data.quotes),
      nasdaq: formatTimestamps(nasdaqData.quotes),
      bitcoin: formatTimestamps(btcData.quotes),
      ethereum: formatTimestamps(ethData.quotes),
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取数据失败: ' + error.message }), { status: 500 });
  }
}
