import { query } from './../../lib/db';

// 通用的时间戳格式化方法
const formatTimestamps = (dataArray) => {
  return dataArray.map((item) => {
    return {
      date: new Date(item.t).toISOString().split('T')[0],
      amount:item.c
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

    const apiKey = process.env.POLYGON_API_KEY;
    const earliestDate = result.rows[0]?.date; // 使用资产数据的最早日期
    const latestDate = result.rows[result.rows.length - 1]?.date || new Date().toISOString().split('T')[0];

    // 获取标普500数据
    const sp500Response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/SPY/range/1/day/${earliestDate}/${latestDate}?apiKey=${apiKey}`
    );
    const sp500Data = await sp500Response.json();

    // 获取纳斯达克数据
    const nasdaqResponse = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/QQQ/range/1/day/${earliestDate}/${latestDate}?apiKey=${apiKey}`
    );
    const nasdaqData = await nasdaqResponse.json();

    // 组合数据库数据与外部API数据
    const responseData = {
      assets: result.rows,
      sp500: formatTimestamps(sp500Data.results),
      nasdaq: formatTimestamps(nasdaqData.results),
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取数据失败: ' + error.message }), { status: 500 });
  }
}
