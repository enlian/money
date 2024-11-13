// app/api/add-amount/route.ts
import { NextResponse } from "next/server";
import { query } from "./../../lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(request: Request) {
  try {
    const { amount, token } = await request.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    if (decoded.username === process.env.ADMIN_USER) {
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
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      { message: "插入失败: " + error },
      { status: 500 }
    );
  }
}
