import { query } from './../../lib/db';

export async function GET() {
  try {
    const result = await query('SELECT date, amount FROM assets ORDER BY date ASC');
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch assets data' +error}), { status: 500 });
  }
}
