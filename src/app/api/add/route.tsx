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
    const today = new Date().toISOString().split("T")[0];

    // 检查当天是否已有相同 amount 的数据
    const checkSameDate = await query(
      "SELECT * FROM assets WHERE amount = $1 AND date = $2",
      [amount, today]
    );

    if (checkSameDate.rows.length > 0) {
      return NextResponse.json(
        { message: "相同数据已存在，且日期为同一天" },
        { status: 400 }
      );
    }

    await query("INSERT INTO assets (amount, date) VALUES ($1, $2)", [
      amount,
      today,
    ]);

    return NextResponse.json({
      message: "数据成功插入",
      amount,
      date: today,
    });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      { message: "插入失败: " + error },
      { status: 500 }
    );
  }
}
