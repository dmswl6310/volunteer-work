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
const POST_CONTENT_TEMPLATE = `예상 활동 내용
- 어떤 봉사활동인지 간단히 소개해주세요.

세부 일정
- 진행 시간:
- 집합 장소:

참여 대상 / 준비물
- 참여 대상:
- 준비물:

참고 사항
- 신청 전에 꼭 알아야 할 내용을 적어주세요.`;

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [authorContact, setAuthorContact] = useState<string>('');
  const [isContactLoading, setIsContactLoading] = useState(true);
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
        setIsContactLoading(false);
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
    <div className="mx-auto max-w-xl min-h-screen bg-slate-50/70 p-4 pb-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Create activity</p>
      <h1 className="mb-6 mt-1 text-2xl font-semibold tracking-[-0.02em] text-slate-900">봉사활동 모집하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isContactLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-semibold text-slate-700">프로필 전화번호를 확인하고 있습니다...</p>
          </div>
        ) : (
          <div className={`rounded-3xl border px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${authorContact ? 'border-indigo-100 bg-white' : 'border-rose-200 bg-rose-50/70'}`}>
            <p className={`text-sm font-semibold ${authorContact ? 'text-slate-800' : 'text-rose-700'}`}>
              게시글 등록 시 프로필에 저장된 전화번호가 게시글에 공개됩니다.
            </p>
            <p className={`mt-1 text-sm ${authorContact ? 'text-slate-500' : 'text-rose-600'}`}>
              현재 공개 예정 번호: {authorContact || '등록된 전화번호가 없습니다.'}
            </p>
            {!authorContact && (
              <Link href="/mypage" className="mt-2 inline-flex text-sm font-semibold text-rose-700 underline underline-offset-2">
                마이페이지에서 전화번호 등록하기
              </Link>
            )}
          </div>
        )}

        {/* Image Upload */}
        <div className="flex flex-col items-center">
          <label htmlFor="image-upload" className="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white transition-colors hover:border-indigo-300 hover:bg-indigo-50/40">
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            ) : (
              <>
                <ImagePlus className="mb-2 h-10 w-10 text-slate-400" strokeWidth={1} />
                <span className="text-sm text-slate-500">이미지 등록 (클릭)</span>
              </>
            )}
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">제목</label>
          <input name="title" required placeholder="봉사활동 제목을 입력하세요" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        </div>

        {/* Urgent & Due Date */}
        <div className="flex gap-4">
          <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">모집 마감 기한</label>
            <input
              type="date"
              name="dueDate"
              required
              min={minimumDueDate}
               className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
             />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isUrgent" value="true" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
              <span className="font-semibold text-rose-600">긴급 모집</span>
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">카테고리</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <label key={cat} className="cursor-pointer" onClick={() => { setSelectedCategory(cat); setCategoryError(null); }}>
                <input type="radio" name="category" value={cat} className="peer hidden" readOnly checked={selectedCategory === cat} />
                <div className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 bg-white text-slate-600'
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
          <label className="mb-1 block text-sm font-medium text-slate-700">내용</label>
          <textarea name="content" required rows={10} defaultValue={POST_CONTENT_TEMPLATE} className="w-full resize-none whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"></textarea>
          <p className="mt-1 text-xs text-slate-500">템플릿을 참고해서 일정, 장소, 준비물, 참고사항을 채워주세요.</p>
        </div>

        {/* Max Participants */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">모집 인원</label>
          <div className="flex items-center space-x-4">
            <input type="range" name="maxParticipants" min="1" max="50" defaultValue="10"
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              onChange={(e) => {
                e.target.nextElementSibling!.textContent = `${e.target.value}명`;
              }}
            />
            <span className="text-lg font-bold text-indigo-600 min-w-[3rem]">10명</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">봉사 시간</label>
          <select
            name="volunteerHours"
            defaultValue="1"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {VOLUNTEER_HOUR_OPTIONS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}시간
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">1시간 단위로 선택할 수 있습니다.</p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading || !authorContact} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-semibold text-white transition-colors shadow-[0_14px_30px_rgba(79,70,229,0.22)] hover:bg-indigo-700 disabled:opacity-50">
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
