export default function PostDetailLoading() {
  return (
    <div className="pb-24 bg-white min-h-screen animate-pulse">
      {/* Top Nav Skeleton */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Image Header Skeleton */}
      <div className="relative w-full aspect-video bg-gray-200"></div>

      <div className="px-5 py-6">
        {/* Title & Category Skeletons */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-12 bg-red-100 rounded-full"></div>
          </div>
          
          <div className="h-8 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          
          <div className="flex items-center space-x-3">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Organizer Profile Skeleton */}
        <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-8">
          <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3 mb-10">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-full pt-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center justify-center h-20">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center justify-center h-20">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        {/* Approved Participants Section Skeleton */}
        <div className="mb-10">
           <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
           <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
           </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="mb-8">
           <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
           <div className="h-32 bg-gray-50 rounded-xl"></div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar Skeleton */}
      <div className="fixed bottom-[64px] left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center justify-between safe-area-bottom max-w-md mx-auto z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-4">
           <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex-1 ml-4 h-12 bg-indigo-100 rounded-xl"></div>
      </div>
    </div>
  );
}
