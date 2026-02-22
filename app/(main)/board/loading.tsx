export default function BoardLoading() {
    return (
        <div className="pb-20 relative min-h-screen">
            {/* Header Skeleton */}
            <div className="bg-white sticky top-0 z-30 px-4 py-3 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="h-7 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    <div className="flex space-x-3 items-center">
                        <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <span className="text-gray-200">|</span>
                        <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                        <span className="text-gray-200">|</span>
                        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                </div>

                {/* Category Filter Skeleton */}
                <div className="flex space-x-2 overflow-x-hidden pb-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-8 w-16 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Urgent Section Skeleton */}
                <div className="animate-pulse">
                    <div className="h-6 w-24 bg-red-100 rounded mb-3"></div>
                    <div className="flex space-x-4 overflow-x-hidden pb-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="min-w-[240px] h-32 bg-gray-200 rounded-xl flex-shrink-0 border border-gray-100"></div>
                        ))}
                    </div>
                </div>

                {/* Post List Skeleton */}
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex animate-pulse">
                            <div className="w-1/3 aspect-square bg-gray-200"></div>
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                                    </div>
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
