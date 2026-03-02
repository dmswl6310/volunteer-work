'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/actions/user-update';
import { useToast } from './ToastProvider';

interface ProfileEditFormProps {
    user: {
        id: string;
        name: string | null;
        username: string;
        contact: string | null;
        address: string | null;
        job: string | null;
    };
}

/** 프로필 수정 폼 컴포넌트 (보기/수정 모드 전환) */
export default function ProfileEditForm({ user }: ProfileEditFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        contact: user.contact || '',
        address: user.address || '',
        job: user.job || ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('프로필을 수정하시겠습니까?')) return;

        setLoading(true);
        try {
            await updateUserProfile(user.id, editForm);
            showToast('프로필 정보가 성공적으로 수정되었습니다.', 'success');
            setIsEditing(false);
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <>
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="프로필 수정"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
                        {user.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">
                            {user.name && user.name !== 'User' ? user.name : user.username}
                        </h2>
                        <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl mb-4">
                    <div>
                        <span className="block text-gray-500 text-xs">연락처</span>
                        <span className="font-medium">{user.contact || '-'}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs">직업</span>
                        <span className="font-medium">{user.job || '-'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-gray-500 text-xs">주소</span>
                        <span className="font-medium truncate block">{user.address || '-'}</span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
                    {user.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-2"
                        placeholder="이름"
                    />
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 mb-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">연락처</label>
                    <input
                        type="text"
                        value={editForm.contact}
                        onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">직업</label>
                        <input
                            type="text"
                            value={editForm.job}
                            onChange={(e) => setEditForm({ ...editForm, job: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">주소</label>
                        <input
                            type="text"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex space-x-2 pt-2">
                    <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50">
                        {loading ? '저장 중...' : '저장'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} disabled={loading} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                        취소
                    </button>
                </div>
            </form>
        </>
    );
}
