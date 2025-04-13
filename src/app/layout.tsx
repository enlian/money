import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import SessionProvider from "./providers/SessionProvider";

export const metadata = {
  title: "资产统计",
  description: "资产统计，并与当下热门资产做对比",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="md:w-[1024px] mx-auto  h-screen">
          <QueryProvider>
            <SessionProvider> {children}</SessionProvider>
          </QueryProvider>
          <Toaster richColors position="top-center" />
        </div>
      </body>
    </html>
  );
}
