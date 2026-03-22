'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { updatePost } from '@/actions/update-post';
import { CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/ToastProvider';
import { ChevronLeft, ImagePlus, Loader2 } from 'lucide-react';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    dueDate: '',
    maxParticipants: 10,
    isUrgent: false,
    isRecruiting: true,
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // 이미지
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      // 로그인 체크
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('로그인 후 이용해 주세요.', 'warning');
        router.push('/auth/login');
        return;
      }

      // 게시글 데이터 불러오기
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error || !post) {
        showToast('존재하지 않거나 삭제된 게시글입니다.', 'error');
        router.push('/board');
        return;
      }

      // 본인 게시글인지 확인
      if (post.author_id !== user.id) {
        showToast('게시글을 수정할 권한이 없습니다.', 'error');
        router.push(`/board/${postId}`);
        return;
      }

      // 폼에 기존 데이터 채우기
      setFormData({
        title: post.title,
        content: post.content,
        dueDate: post.due_date ? post.due_date.split('T')[0] : '',
        maxParticipants: post.max_participants ?? 10,
        isUrgent: post.is_urgent ?? false,
        isRecruiting: post.is_recruiting ?? true,
      });
      setSelectedCategory(post.category ?? '');
      setExistingImageUrl(post.image_url ?? null);
      setPreviewUrl(post.image_url ?? null);
      setInitialLoading(false);
    };
    load();
  }, [postId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCategory) {
      setCategoryError('카테고리를 선택해주세요.');
      return;
    }
    setCategoryError(null);
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', selectedCategory);
    data.append('maxParticipants', String(formData.maxParticipants));
    data.append('isUrgent', String(formData.isUrgent));
    data.append('isRecruiting', String(formData.isRecruiting));
    data.append('dueDate', formData.dueDate);

    // 새 이미지 업로드
    let imageUrl = existingImageUrl ?? '';
    if (selectedImage) {
      const ext = selectedImage.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filename, selectedImage);

      if (uploadError) {
        showToast('이미지 업로드에 실패했습니다.', 'error');
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(filename);
      imageUrl = publicUrlData.publicUrl;
    }
    data.append('imageUrl', imageUrl);

    try {
      const result = await updatePost(postId, data);
      if (result?.error) {
        showToast(result.error, 'warning');
        setLoading(false);
        return;
      }
      if (result?.success) {
        router.push(`/board/${postId}`);
      }
    } catch (error: any) {
      showToast(error.message || '게시글 수정 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold">게시글 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이미지 업로드 */}
        <div className="flex flex-col items-center">
          <label htmlFor="image-upload" className="w-full h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors overflow-hidden relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus className="w-10 h-10 text-gray-400 mb-2" strokeWidth={1} />
                <span className="text-sm text-gray-500">이미지 변경 (클릭)</span>
              </>
            )}
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="봉사활동 제목을 입력하세요"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* 마감일 & 긴급 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">마감 기한</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              min={new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="font-bold text-red-500">긴급 모집</span>
            </label>
          </div>
        </div>

        {/* 카테고리 */}
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

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={8}
            placeholder="상세 활동 내용을 입력하세요"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
          />
        </div>

        {/* 모집 인원 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원</label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="50"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-lg font-bold text-indigo-600 min-w-[3rem]">{formData.maxParticipants}명</span>
          </div>
        </div>

        {/* 모집 상태 */}
        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${formData.isRecruiting ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
          <div>
            <p className={`font-bold ${formData.isRecruiting ? 'text-green-700' : 'text-red-700'}`}>
              {formData.isRecruiting ? '🟢 모집 중' : '🔴 모집 마감'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formData.isRecruiting ? '참여 신청을 받고 있습니다.' : '더 이상 신청을 받지 않습니다.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isRecruiting: !formData.isRecruiting })}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${formData.isRecruiting
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
          >
            {formData.isRecruiting ? '마감으로 변경' : '모집 재개'}
          </button>
        </div>

        {/* 제출 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>수정 중...</span>
            </>
          ) : (
            '수정 완료'
          )}
        </button>
      </form>
    </div>
  );
}
