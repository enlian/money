import yahooFinance from 'yahoo-finance2'; // 使用 yahoo-finance2 库

// 通用的时间戳格式化方法
const formatTimestamps = (dataArray) => {
  return dataArray.map((item) => {
    return {
      date: item.date, // 使用返回的数据中的日期
      amount: item.close, // 收盘价作为金额
    };
  });
};

export async function GET() {
  try {
    // 统一设置日期范围为 2022 年底到当前最新日期
    const startDate = '2022-12-31';
    const endDate = new Date().toISOString().split('T')[0]; // 当前日期

    // 获取道琼斯指数数据
    const dowJonesData = await yahooFinance.chart('^DJI', {
      period1: startDate,
      period2: endDate,
      interval: '1d', // 每日数据
    });

    // 获取标普500数据
    const sp500Data = await yahooFinance.chart('SPY', {
      period1: startDate,
      period2: endDate,
      interval: '1d', // 每日数据
    });

    // 获取纳斯达克数据
    const nasdaqData = await yahooFinance.chart('QQQ', {
      period1: startDate,
      period2: endDate,
      interval: '1d', // 每日数据
    });

    // 获取比特币数据
    const btcData = await yahooFinance.chart('BTC-USD', {
      period1: startDate,
      period2: endDate,
      interval: '1d', // 每日数据
    });

    // 获取以太坊数据
    const ethData = await yahooFinance.chart('ETH-USD', {
      period1: startDate,
      period2: endDate,
      interval: '1d', // 每日数据
    });

    // 组合外部 API 数据
    const responseData = {
      assets: formatTimestamps(dowJonesData.quotes), // 道琼斯指数数据
      sp500: formatTimestamps(sp500Data.quotes), // 标普500数据
      nasdaq: formatTimestamps(nasdaqData.quotes), // 纳斯达克数据
      bitcoin: formatTimestamps(btcData.quotes), // 比特币数据
      ethereum: formatTimestamps(ethData.quotes), // 以太坊数据
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取数据失败: ' + error.message }), { status: 500 });
  }
}
