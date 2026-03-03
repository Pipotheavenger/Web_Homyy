export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="hidden md:block w-64 h-screen bg-white border-r animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b animate-pulse" />
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Chat list skeleton */}
            <div className="w-80 border-r bg-white p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            {/* Message area skeleton */}
            <div className="flex-1 bg-gray-50 p-6 flex items-center justify-center">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
