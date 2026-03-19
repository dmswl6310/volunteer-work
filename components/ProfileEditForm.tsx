'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/actions/user-update';
import { useToast } from './ToastProvider';
import { Pencil, X } from 'lucide-react';
import type { Address } from 'react-daum-postcode';
import dynamic from 'next/dynamic';

const DaumPostcode = dynamic(() => import('react-daum-postcode'), { 
  ssr: false,
  loading: () => <div className="p-10 text-center text-sm text-gray-500">주소 검색 화면을 불러오는 중입니다...</div>
});

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
        detailAddress: '', // 프로필 수정에서는 기본적으로 빈 칸 제공, 나중에 합쳐서 address로 저장
        job: user.job || ''
    });
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('프로필을 수정하시겠습니까?')) return;

        setLoading(true);
        try {
            const finalAddress = editForm.detailAddress 
              ? `${editForm.address} ${editForm.detailAddress}`.trim() 
              : editForm.address;
              
            await updateUserProfile(user.id, { ...editForm, address: finalAddress });
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
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="프로필 수정"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl mb-4">
                    <div>
                        <span className="block text-gray-500 text-xs mb-1">연락처</span>
                        <span className="font-bold text-gray-900">{user.contact || '-'}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs mb-1">직업 / 소속기관</span>
                        <span className="font-bold text-gray-900">{user.job || '-'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-gray-500 text-xs mb-1">주소</span>
                        <span className="font-bold text-gray-900 truncate block">{user.address || '-'}</span>
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
                        <label className="block text-xs text-gray-500 mb-1">직업 / 소속기관</label>
                        <input
                            type="text"
                            value={editForm.job}
                            onChange={(e) => setEditForm({ ...editForm, job: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">주소</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={editForm.address}
                                className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-900 font-medium focus:outline-none sm:text-sm cursor-not-allowed"
                                placeholder="기본 주소"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPostcodeOpen(true)}
                                className="whitespace-nowrap px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none transition-colors"
                            >
                                주소 검색
                            </button>
                        </div>
                        <input
                            type="text"
                            value={editForm.detailAddress}
                            onChange={(e) => setEditForm({ ...editForm, detailAddress: e.target.value })}
                            className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="상세 주소 (예: 101동 202호)"
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

            {/* 우편번호 검색 팝업 (모달) */}
            {isPostcodeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold">주소 검색</h3>
                            <button 
                                type="button"
                                onClick={() => setIsPostcodeOpen(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-0">
                            <DaumPostcode
                                onComplete={(data: Address) => {
                                    let fullAddress = data.address;
                                    let extraAddress = '';

                                    if (data.addressType === 'R') {
                                        if (data.bname !== '') {
                                            extraAddress += data.bname;
                                        }
                                        if (data.buildingName !== '') {
                                            extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                                        }
                                        fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
                                    }

                                    setEditForm({ ...editForm, address: fullAddress, detailAddress: '' });
                                    setIsPostcodeOpen(false);
                                }}
                                autoClose={false}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
