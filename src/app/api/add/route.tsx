// app/api/add-amount/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { query } from "./../../lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { valid: false, message: "无权限访问" },
        { status: 401 }
      );
    }

    const { amount } = await request.json();
    const currentTimestamp = Math.floor(Date.now() / 1000); // 当前时间戳，单位为秒
    const previousDay = currentTimestamp - 86399;

    const checkSameDate = await query(
      "SELECT * FROM assets WHERE amount = $1 AND date >= $2",
      [amount, previousDay]
    );

    if (checkSameDate.rows.length > 0) {
      return NextResponse.json(
        { message: "相同数据已存在，且日期为同一天" },
        { status: 400 }
      );
    }

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
