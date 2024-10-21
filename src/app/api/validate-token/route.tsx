import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  if (!JWT_SECRET || !process.env.ADMIN_USER) {
    return NextResponse.json(
      { valid: false, error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string }; // 明确类型
    if (decoded.username === process.env.ADMIN_USER) {
      return NextResponse.json({ valid: true }, { status: 200 });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error: any) {
    // 处理 jwt.verify 抛出的不同错误类型
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { valid: false, error: "Token expired" },
        { status: 401 }
      );
    } else if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { valid: false, error: "Token verification failed" },
        { status: 401 }
      );
    }
  }
}
