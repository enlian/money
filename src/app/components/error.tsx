import { Button } from "@/components/ui/button";

interface ErrorProps {
  errorMessage: string;
  fetchData: () => void;
}

export default function Error({ errorMessage, fetchData }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 gap-4">
      <p>发生错误...</p>
      <Button onClick={fetchData}>重试</Button>
    </div>
  );
}
