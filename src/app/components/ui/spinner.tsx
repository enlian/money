export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 gap-4">
      <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-gray-500"></div>
    </div>
  );
}
