'use client';

import { useCallback, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getPosts, PostWithAuthor } from '@/actions/posts';
import PostCard from './PostCard';

interface InfiniteScrollBoardProps {
  initialPosts: PostWithAuthor[];
  initialNextId: number | null;
  sort?: 'latest' | 'deadline';
  category?: string;
  status?: 'recruiting' | 'closed' | 'all';
  q?: string;
}

/** 무한 스크롤로 게시글 목록을 불러오는 클라이언트 컴포넌트 */
export default function InfiniteScrollBoard({ initialPosts, initialNextId, sort = 'latest', category, status = 'recruiting', q }: InfiniteScrollBoardProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [nextId, setNextId] = useState<number | null>(initialNextId);
  const nextIdRef = useRef<number | null>(initialNextId);
  const loadingRef = useRef(false);

  const loadMorePosts = useCallback(async () => {
    if (nextIdRef.current === null || loadingRef.current) return;

    loadingRef.current = true;
    const newPosts = await getPosts({ page: nextIdRef.current, sort, category, status, q });
    setPosts((prev) => [...prev, ...newPosts.posts]);
    setNextId(newPosts.nextId);
    nextIdRef.current = newPosts.nextId;
    loadingRef.current = false;
  }, [category, q, sort, status]);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void loadMorePosts();
      }
    },
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} priorityImage={post.id === posts[0]?.id || post.id === posts[1]?.id} />
        ))}
      </div>

      {nextId !== null && (
        <div ref={ref} className="flex justify-center p-4 mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {nextId === null && posts.length > 0 && (
        <div className="p-8 text-center text-sm text-slate-400">
          모든 게시물을 불러왔습니다.
        </div>
      )}

      {posts.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-20 text-center text-slate-400">
          등록된 봉사활동이 없습니다.
        </div>
      )}
    </>
  );
}
