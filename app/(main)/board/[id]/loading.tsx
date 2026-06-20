export default function PostDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-50/70 pb-24">
      {/* Top Nav Skeleton */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="h-10 w-10 rounded-full bg-slate-200"></div>
        <div className="h-4 w-32 rounded bg-slate-200"></div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Image Header Skeleton */}
      <div className="relative aspect-video w-full bg-slate-200"></div>

      <div className="px-5 py-6">
        {/* Title & Category Skeletons */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-6 w-16 rounded-full bg-slate-200"></div>
            <div className="h-6 w-12 rounded-full bg-slate-200"></div>
          </div>
          
          <div className="mb-3 h-8 w-full rounded bg-slate-200"></div>
          <div className="mb-4 h-8 w-3/4 rounded bg-slate-200"></div>
          
          <div className="flex items-center space-x-3">
            <div className="h-4 w-24 rounded bg-slate-200"></div>
            <div className="h-4 w-16 rounded bg-slate-200"></div>
          </div>
        </div>

        {/* Organizer Profile Skeleton */}
        <div className="mb-8 flex items-center rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mr-4 h-12 w-12 rounded-2xl bg-slate-200"></div>
          <div className="flex-1">
            <div className="mb-2 h-5 w-32 rounded bg-slate-200"></div>
            <div className="h-3 w-20 rounded bg-slate-200"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="mb-10 space-y-3 rounded-3xl border border-slate-200 bg-white px-5 py-6">
          <div className="h-4 w-full rounded bg-slate-200"></div>
          <div className="h-4 w-full rounded bg-slate-200"></div>
          <div className="h-4 w-5/6 rounded bg-slate-200"></div>
          <div className="h-4 w-4/5 rounded bg-slate-200"></div>
          <div className="h-4 w-full rounded bg-slate-200 pt-4"></div>
          <div className="h-4 w-3/4 rounded bg-slate-200"></div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="flex h-20 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-4">
            <div className="mb-2 h-3 w-16 rounded bg-slate-200"></div>
            <div className="h-5 w-24 rounded bg-slate-200"></div>
          </div>
          <div className="flex h-20 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-4">
            <div className="mb-2 h-3 w-16 rounded bg-slate-200"></div>
            <div className="h-5 w-24 rounded bg-slate-200"></div>
          </div>
        </div>
        
        {/* Approved Participants Section Skeleton */}
        <div className="mb-10">
           <div className="mb-4 h-5 w-40 rounded bg-slate-200"></div>
           <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="mb-1 h-10 w-10 rounded-full bg-slate-200"></div>
                  <div className="h-3 w-12 rounded bg-slate-200"></div>
                </div>
              ))}
           </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="mb-8">
           <div className="mb-4 h-6 w-32 rounded bg-slate-200"></div>
           <div className="h-32 rounded-3xl border border-slate-200 bg-white"></div>
         </div>
      </div>

      {/* Bottom Sticky Action Bar Skeleton */}
      <div className="fixed bottom-[64px] left-0 right-0 z-40 mx-auto flex max-w-md items-center justify-between border-t border-slate-200 bg-white/95 p-4 pb-safe shadow-[0_-8px_20px_rgba(15,23,42,0.06)] backdrop-blur safe-area-bottom">
        <div className="flex items-center space-x-4">
           <div className="h-10 w-10 rounded-2xl bg-slate-200"></div>
        </div>
        <div className="ml-4 h-12 flex-1 rounded-2xl bg-amber-100"></div>
      </div>
    </div>
  );
}
