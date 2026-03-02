'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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
                            className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
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
                                className="ml-1.5 p-0.5 text-indigo-400 hover:text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
                                aria-label="검색어 초기화"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <button
                        onClick={toggleSearch}
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                        aria-label="검색 열기"
                    >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSearch} className="absolute inset-0 bg-white z-20 flex items-center px-4 animate-fade-in">
                    <div className="relative w-full flex items-center">
                        <button
                            type="button"
                            onClick={toggleSearch}
                            className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="검색 닫기"
                        >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <input
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                            type="text"
                            className="flex-1 bg-gray-100 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                <svg className="h-4 w-4 bg-gray-200 rounded-full p-0.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
