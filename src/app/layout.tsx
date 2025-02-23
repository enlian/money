import { AuthProvider } from "./context/AuthContext";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";

export const metadata = {
  title: "我的资产统计",
  description: "资产统计，并与当下热门资产做对比",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex justify-center h-screen">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
