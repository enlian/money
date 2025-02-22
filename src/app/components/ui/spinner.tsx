export default function Spinner() {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white/70 z-50">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-gray-500"></div>
      </div>
    );
  }
  