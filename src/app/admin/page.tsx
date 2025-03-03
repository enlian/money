"use client";

import AddAmountModal from "@/components/add-amount-modal";
import LoginModal from "@/components/login-modal";
import Spinner from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/");
  }

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 h-full w-[550px]">
      <div className="flex justify-end gap-3">
        <AddAmountModal onSuccess={() => {}} />
        <LoginModal />
      </div>
    </div>
  );
}
