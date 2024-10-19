// app/assets/page.js
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { query } from '../../lib/db';

export default async function AssetsPage() {
  // 在服务器端获取数据
  const result = await query('SELECT record_date, amount FROM financial_records ORDER BY record_date ASC');
  const data = result.rows;

  // 处理数据用于 Chart.js
  const labels = data.map(item => item.record_date);
  const amounts = data.map(item => item.amount);

  const chartData = {
    labels,
    datasets: [
      {
        label: '资产金额',
        data: amounts,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h1>资产趋势图</h1>
      <Line data={chartData} />
    </div>
  );
}
