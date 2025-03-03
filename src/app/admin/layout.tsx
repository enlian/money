"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/");
  }

  if (status === "loading") {
    return <p>加载中...</p>;
  }

  return (
    <div>
      <nav>🔒 Admin Panel</nav>
      <main>{children}</main>
    </div>
  );
}
