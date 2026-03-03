export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="hidden md:block w-64 h-screen bg-white border-r animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
