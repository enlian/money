import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 管理员
const admin = {
  id: 1,
  username: process.env.ADMIN_USER,
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
};

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET;

// POST 请求处理器
export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (
      username === admin.username &&
      bcrypt.compareSync(password, admin.passwordHash)
    ) {
      // 生成JWT
      const token = jwt.sign(
        { userId: admin.id, username: admin.username },
        JWT_SECRET,
        { expiresIn: "30d" }
      );
      // 返回token
      return NextResponse.json({ token }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: "发生错误" }, { status: 500 });
  }
}
