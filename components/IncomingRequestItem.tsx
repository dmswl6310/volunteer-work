'use client';

import { updateApplicationStatus } from '@/actions/apply';
import { useState } from 'react';
import { useToast } from './ToastProvider';

/** 들어오는 신청 항목 컴포넌트 (승인/거절 버튼 포함) */
export default function IncomingRequestItem({ application }: { application: any }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleStatus = async (status: 'approved' | 'rejected') => {
    if (!confirm(`${status === 'approved' ? '승인' : '거절'}하시겠습니까?`)) return;
    setLoading(true);
    try {
      await updateApplicationStatus(application.id, status);
      showToast(`${status === 'approved' ? '승인' : '거절'}되었습니다.`, 'success');
      window.location.reload();
    } catch (error: any) {
      showToast(error.message, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
      <div>
        <p className="font-bold text-gray-900 text-base mb-1">
          {application.users?.name && application.users.name !== 'User' ? application.users.name : application.users?.username}
          <span className="text-gray-500 font-normal text-sm ml-1">(@{application.users?.username})</span>
        </p>
        <div className="text-sm text-gray-600 mb-2 space-y-0.5">
          {application.users?.contact && <p>📞 연락처: {application.users.contact}</p>}
          {application.users?.email && <p>📧 이메일: {application.users.email}</p>}
          {application.users?.job && <p>💼 직업: {application.users.job}</p>}
          {application.users?.address && <p>🏠 거주지: {application.users.address}</p>}
        </div>
        <p className="text-xs text-gray-400">
          신청일: {new Date(application.created_at).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          지원 공고: <span className="font-medium text-gray-600">{application.post.title}</span>
        </p>
      </div>
      <div className="flex flex-col space-y-2 ml-4">
        <button
          onClick={() => handleStatus('approved')}
          disabled={loading}
          className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg hover:bg-green-200 transition-colors"
        >
          승인하기
        </button>
        <button
          onClick={() => handleStatus('rejected')}
          disabled={loading}
          className="px-4 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-lg hover:bg-red-200 transition-colors"
        >
          거절하기
        </button>
      </div>
    </div>
  );
}
