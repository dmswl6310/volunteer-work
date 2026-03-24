'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { createPost } from '@/actions/create-post';
import { CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/ToastProvider';
import { ImagePlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const VOLUNTEER_HOUR_OPTIONS = Array.from({ length: 100 }, (_, index) => index + 1);

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [authorContact, setAuthorContact] = useState<string>('');
  const [minimumDueDate] = useState(() => new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Category State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    // Check Auth
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('로그인 후 이용해 주세요.', 'warning');
        router.push('/auth/login');
      } else {
        setUserId(user.id);

        const { data: profile } = await supabase
          .from('users')
          .select('contact')
          .eq('id', user.id)
          .maybeSingle();

        setAuthorContact(profile?.contact?.trim() ?? '');
      }
    };
    checkAuth();
  }, [router, showToast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    if (!selectedCategory) {
      setCategoryError('카테고리를 선택해주세요.');
      return;
    }

    if (!authorContact) {
      showToast('게시글에 표시할 전화번호를 먼저 프로필에 등록해 주세요.', 'warning');
      router.push('/mypage');
      return;
    }

    setCategoryError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Upload Image to Supabase Storage if selected
    // Note: User needs to create a 'posts' bucket in Supabase Storage with public access policy
    let imageUrl = '';
    if (selectedImage) {
      const ext = selectedImage.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('posts')
        .upload(filename, selectedImage);

      if (error) {
        console.error('Image upload failed:', error);
        showToast('이미지 업로드에 실패했습니다.', 'error');
        // Proceed without image or return? Let's proceed for robustness in demo
      } else {
        const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(filename);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    formData.append('imageUrl', imageUrl);

    try {
      const result = await createPost(formData); // Server Action
      if (result?.error) {
        showToast(result.error, 'warning');
        setLoading(false);
        return;
      }
      if (result?.success) {
        router.push('/board');
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '게시글 등록 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="max-w-xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">봉사활동 모집하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`rounded-xl border px-4 py-3 ${authorContact ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-sm font-semibold ${authorContact ? 'text-amber-800' : 'text-red-700'}`}>
            게시글 등록 시 프로필에 저장된 전화번호가 게시글에 공개됩니다.
          </p>
          <p className={`mt-1 text-sm ${authorContact ? 'text-amber-700' : 'text-red-600'}`}>
            현재 공개 예정 번호: {authorContact || '등록된 전화번호가 없습니다.'}
          </p>
          {!authorContact && (
            <Link href="/mypage" className="mt-2 inline-flex text-sm font-semibold text-red-700 underline underline-offset-2">
              마이페이지에서 전화번호 등록하기
            </Link>
          )}
        </div>

        {/* Image Upload */}
        <div className="flex flex-col items-center">
          <label htmlFor="image-upload" className="w-full h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors overflow-hidden relative">
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            ) : (
              <>
                <ImagePlus className="w-10 h-10 text-gray-400 mb-2" strokeWidth={1} />
                <span className="text-sm text-gray-500">이미지 등록 (클릭)</span>
              </>
            )}
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input name="title" required placeholder="봉사활동 제목을 입력하세요" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
        </div>

        {/* Urgent & Due Date */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">마감 기한</label>
            <input
              type="date"
              name="dueDate"
              required
              min={minimumDueDate}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isUrgent" value="true" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
              <span className="font-bold text-red-500">긴급 모집</span>
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <label key={cat} className="cursor-pointer" onClick={() => { setSelectedCategory(cat); setCategoryError(null); }}>
                <input type="radio" name="category" value={cat} className="peer hidden" readOnly checked={selectedCategory === cat} />
                <div className={`px-4 py-2 rounded-full border text-sm transition-all ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-600'
                  }`}>
                  {cat}
                </div>
              </label>
            ))}
          </div>
          {categoryError && <p className="mt-1 text-sm text-red-500">{categoryError}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea name="content" required rows={8} placeholder="상세 활동 내용을 입력하세요" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"></textarea>
        </div>

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원</label>
          <div className="flex items-center space-x-4">
            <input type="range" name="maxParticipants" min="1" max="50" defaultValue="10"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              onChange={(e) => {
                e.target.nextElementSibling!.textContent = `${e.target.value}명`;
              }}
            />
            <span className="text-lg font-bold text-indigo-600 min-w-[3rem]">10명</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">봉사 시간</label>
          <select
            name="volunteerHours"
            defaultValue="1"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            {VOLUNTEER_HOUR_OPTIONS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}시간
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">1시간 단위로 선택할 수 있습니다.</p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading || !authorContact} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>등록 중...</span>
            </>
          ) : (
            '봉사활동 모집하기'
          )}
        </button>
      </form>
    </div>
  );
}
