export default function MyPageLoading() {
    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-30">
                <h1 className="text-lg font-bold text-center">내 정보</h1>
            </div>

            <div className="p-4 space-y-6">
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex animate-pulse space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 py-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-gray-100 rounded-xl"></div>
                        <div className="h-10 bg-gray-100 rounded-xl"></div>
                        <div className="col-span-2 h-10 bg-gray-100 rounded-xl"></div>
                    </div>
                </section>

                <section className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-24 bg-white rounded-xl shadow-sm"></div>
                </section>
            </div>
        </div>
    );
}
