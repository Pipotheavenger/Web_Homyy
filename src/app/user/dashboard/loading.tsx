export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="hidden md:block w-64 h-screen bg-white border-r animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b animate-pulse" />
          <div className="p-6 space-y-4">
            {/* Banner skeleton */}
            <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl animate-pulse" />
            {/* Grid: servicios + profesionales */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
