'use client';

import { useState, useEffect } from 'react';
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
  const { ref, inView } = useInView();

  // 정렬/필터 변경 시 상태 초기화
  useEffect(() => {
    setPosts(initialPosts);
    setNextId(initialNextId);
  }, [sort, category, status, q, initialPosts, initialNextId]);

  const loadMorePosts = async () => {
    if (nextId === null) return;

    const newPosts = await getPosts({ page: nextId, sort, category, status, q });
    setPosts((prev) => [...prev, ...newPosts.posts]);
    setNextId(newPosts.nextId);
  };

  useEffect(() => {
    if (inView && nextId !== null) {
      loadMorePosts();
    }
  }, [inView, nextId]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {nextId !== null && (
        <div ref={ref} className="flex justify-center p-4 mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {nextId === null && posts.length > 0 && (
        <div className="text-center p-8 text-gray-400 text-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          등록된 봉사활동이 없습니다.
        </div>
      )}
    </>
  );
}
