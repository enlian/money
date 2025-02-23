import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  errorMessage: string;
  fetchData: () => void;
}

export default function Error({ errorMessage, fetchData }: ErrorProps) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 min-h-screen justify-center items-center">
      <p>{errorMessage}</p>
      <Button onClick={fetchData}>重试</Button>
    </div>
  );
}
