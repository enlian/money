// app/api/add-amount/route.ts
import { NextResponse } from "next/server";
import { query } from "./../../lib/db";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    const currentTimestamp = Math.floor(Date.now() / 1000); // 当前时间戳，单位为秒

    // 执行数据库插入
    await query("INSERT INTO assets (amount, date) VALUES ($1, $2)", [
      amount,
      currentTimestamp,
    ]);

    return NextResponse.json({
      message: "数据成功插入",
      amount,
      date: currentTimestamp,
    });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      { message: "插入失败: " + error },
      { status: 500 }
    );
  }
}
