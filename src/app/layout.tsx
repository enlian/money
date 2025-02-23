import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
