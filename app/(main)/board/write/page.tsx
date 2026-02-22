'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { createPost } from '@/actions/create-post';

// Categories mock
const CATEGORIES = ['교육봉사', '환경정화', '동물보호', '노인돕기', '기타'];

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
      } else {
        setUserId(user.id);
      }
    };
    checkAuth();
  }, [router]);

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
    setCategoryError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('userId', userId);

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      formData.append('email', user.email);
    }
    if (user?.user_metadata?.name) {
      formData.append('name', user.user_metadata.name);
    }

    // Upload Image to Supabase Storage if selected
    // Note: User needs to create a 'posts' bucket in Supabase Storage with public access policy
    let imageUrl = '';
    if (selectedImage) {
      const ext = selectedImage.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filename, selectedImage);

      if (error) {
        console.error('Image upload failed:', error);
        alert(`이미지 업로드 실패: ${error.message}`);
        // Proceed without image or return? Let's proceed for robustness in demo
      } else {
        const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(filename);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    formData.append('imageUrl', imageUrl);

    try {
      await createPost(formData); // Server Action
      // Redirect handled by Server Action
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="max-w-xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">봉사활동 모집하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="flex flex-col items-center">
          <label htmlFor="image-upload" className="w-full h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors overflow-hidden relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
              min={new Date().toISOString().split('T')[0]}
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
                <div className={`px-4 py-2 rounded-full border text-sm transition-all ${
                  selectedCategory === cat
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
                const val = e.target.value;
                const span = document.getElementById('participant-count');
                if (span) span.innerText = `${val}명`;
              }}
            />
            <span id="participant-count" className="text-lg font-bold text-indigo-600 min-w-[3rem]">10명</span>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50">
          {loading ? '등록 중...' : '봉사활동 모집하기'}
        </button>
      </form>
    </div>
  );
}
