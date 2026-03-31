'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';

/** 검색 입력 컴포넌트 (확장/접기 애니메이션 지원) */
export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [displayedQuery, setDisplayedQuery] = useState(initialQuery); // Optimistic UI state
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        // Default to reset pagination on search
        params.delete('page');

        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            params.set('q', trimmedQuery);
            setDisplayedQuery(trimmedQuery); // Update immediately
        } else {
            params.delete('q');
            setDisplayedQuery('');
        }

        setIsExpanded(false); // Close the search input overlay on search submit
        router.push(`/board?${params.toString()}`);
    };

    const toggleSearch = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded && !query.trim()) {
            // User closed it without searching
            const params = new URLSearchParams(searchParams.toString());
            if (params.has('q')) {
                params.delete('q');
                router.push(`/board?${params.toString()}`);
            }
        }
    };

    return (
        <div className="flex justify-end items-center h-10">
            {!isExpanded ? (
                <div className="flex items-center space-x-2">
                    {displayedQuery && (
                        <div
                            className="flex items-center rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700 transition-colors cursor-pointer hover:bg-teal-100"
                            onClick={toggleSearch}
                        >
                            <span className="truncate max-w-[120px]">{displayedQuery}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.delete('q');
                                    params.delete('page');
                                    setDisplayedQuery('');
                                    setQuery('');
                                    router.push(`/board?${params.toString()}`);
                                }}
                                className="ml-1.5 rounded-full p-0.5 text-teal-400 transition-colors hover:bg-teal-200 hover:text-teal-600"
                                aria-label="검색어 초기화"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={toggleSearch}
                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-teal-600"
                        aria-label="검색 열기"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSearch} className="absolute inset-0 z-20 flex items-center rounded-3xl border border-gray-100 bg-white px-4 shadow-sm animate-fade-in">
                    <div className="relative w-full flex items-center">
                        <button
                            type="button"
                            onClick={toggleSearch}
                            className="-ml-2 mr-2 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            aria-label="검색 닫기"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <input
                            autoFocus
                            type="text"
                            className="flex-1 rounded-2xl border-none bg-gray-100 py-2 pl-4 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="봉사활동 검색..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-3 p-1 text-gray-400 hover:text-gray-600"
                                aria-label="검색어 지우기"
                            >
                                <X className="h-4 w-4 bg-gray-200 rounded-full p-0.5 text-white" />
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
