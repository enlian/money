import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {},
        password: { type: "password" },
      },
      async authorize(credentials) {
        const storedUser = process.env.USER_NAME;
        const storedPassword = process.env.USER_PASSWORD;

        if (!credentials || !credentials.username || !credentials.password) {
          throw new Error("请输入用户名和密码");
        }

        if (
          credentials.username === storedUser &&
          credentials.password === storedPassword
        ) {
          return { id: "1", username: storedUser, role: "admin" };
        }

        throw new Error("用户名或密码错误");
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          userId: token.sub,
          role: "admin",
        },
        message: "登录成功",
      };
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
