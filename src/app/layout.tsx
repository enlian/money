import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import SessionProvider from "./providers/SessionProvider";

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
      <body className="justify-center h-screen max-w-6xl mx-auto">
        <QueryProvider>
          <SessionProvider> {children}</SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
