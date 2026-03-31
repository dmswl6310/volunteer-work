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
    const { showToast, showConfirm } = useToast();
    const [editForm, setEditForm] = useState({
        contact: user.contact || '',
        address: user.address || '',
        detailAddress: '', // 프로필 수정에서는 기본적으로 빈 칸 제공, 나중에 합쳐서 address로 저장
        job: user.job || ''
    });
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const confirmed = await showConfirm('프로필을 수정하시겠습니까?', {
            title: '프로필 수정',
            confirmLabel: '저장하기',
        });
        if (!confirmed) return;

        setLoading(true);
        try {
            const finalAddress = editForm.detailAddress 
              ? `${editForm.address} ${editForm.detailAddress}`.trim() 
              : editForm.address;
              
            await updateUserProfile({ ...editForm, address: finalAddress });
            showToast('프로필 정보가 성공적으로 수정되었습니다.', 'success');
            setIsEditing(false);
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : '프로필 수정 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <>
                <div className="mb-7 flex items-start space-x-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-semibold text-indigo-600">
                        {user.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Account details</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">
                            {user.username || '이름 없음'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">닉네임은 가입 후 변경할 수 없습니다.</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-2xl border border-slate-200 p-2.5 text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
                        title="프로필 수정"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">연락처</span>
                        <span className="font-semibold text-slate-900">{user.contact || '-'}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">직업 / 소속기관</span>
                        <span className="font-semibold text-slate-900">{user.job || '-'}</span>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">주소</span>
                        <span className="block truncate font-semibold text-slate-900">{user.address || '-'}</span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="mb-7 flex items-start space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-semibold text-indigo-600">
                    {user.username?.[0] || 'U'}
                </div>
                <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Edit profile</p>
                    <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">{user.username || '이름 없음'}</p>
                    <p className="mt-1 text-sm text-slate-500">닉네임은 가입할 때 한 번만 설정할 수 있습니다.</p>
                </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="mb-4 space-y-5">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">연락처</label>
                    <input
                        type="text"
                        value={editForm.contact}
                        onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                        className="block w-full rounded-2xl border-slate-200 bg-white px-4 py-3 shadow-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">직업 / 소속기관</label>
                        <input
                            type="text"
                            value={editForm.job}
                            onChange={(e) => setEditForm({ ...editForm, job: e.target.value })}
                            className="block w-full rounded-2xl border-slate-200 bg-white px-4 py-3 shadow-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">주소</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={editForm.address}
                                className="block w-full cursor-not-allowed rounded-2xl border-slate-200 bg-slate-50 text-slate-900 px-4 py-3 font-medium shadow-none focus:outline-none sm:text-sm"
                                placeholder="기본 주소"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPostcodeOpen(true)}
                                className="whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 focus:outline-none"
                            >
                                주소 검색
                            </button>
                        </div>
                        <input
                            type="text"
                            value={editForm.detailAddress}
                            onChange={(e) => setEditForm({ ...editForm, detailAddress: e.target.value })}
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-white px-4 py-3 shadow-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="상세 주소 (예: 101동 202호)"
                        />
                    </div>
                </div>
                <div className="flex space-x-2 pt-2">
                    <button type="submit" disabled={loading} className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? '저장 중...' : '저장'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} disabled={loading} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50">
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
