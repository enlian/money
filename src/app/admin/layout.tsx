"use client";

import { useAuth } from "../context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAuthenticating, token } = useAuth();

  //   if (!token) {
  //     redirect("/");
  //   }

  return (
    <div>
      <nav>🔒 Admin Panel</nav>
      <main>{children}</main>
    </div>
  );
}
