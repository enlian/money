import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// 环境变量类型保护
const adminUsername = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!adminUsername || !adminPassword || !JWT_SECRET) {
  throw new Error("缺少必要的环境变量");
}

// 管理员
const admin = {
  id: 1,
  username: adminUsername,
  passwordHash: bcrypt.hashSync(adminPassword, 10),
};

// POST 请求处理器
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { username, password }: { username: string; password: string } = body;

    if (
      username === admin.username &&
      bcrypt.compareSync(password, admin.passwordHash)
    ) {
      // 生成JWT
      const token = jwt.sign(
        { userId: admin.id, username: admin.username },
        JWT_SECRET as string,
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
