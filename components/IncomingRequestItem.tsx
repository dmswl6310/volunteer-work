'use client';

import { updateApplicationStatus } from '@/actions/apply';
import { useState } from 'react';

export default function IncomingRequestItem({ application }: { application: any }) {
  const [loading, setLoading] = useState(false);

  const handleStatus = async (status: 'approved' | 'rejected') => {
    if (!confirm(`${status === 'approved' ? '승인' : '거절'}하시겠습니까?`)) return;
    setLoading(true);
    try {
      await updateApplicationStatus(application.id, status);
      alert('처리되었습니다.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
      <div>
        <p className="font-bold text-gray-900">
          {application.user.name && application.user.name !== 'User' ? application.user.name : application.user.username}
          <span className="text-gray-500 font-normal text-sm ml-1">(@{application.user.username})</span>
        </p>
        <p className="text-sm text-gray-500">
          신청일: {new Date(application.createdAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          게시글: {application.post.title}
        </p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleStatus('approved')}
          disabled={loading}
          className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded hover:bg-green-200"
        >
          승인
        </button>
        <button
          onClick={() => handleStatus('rejected')}
          disabled={loading}
          className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded hover:bg-red-200"
        >
          거절
        </button>
      </div>
    </div>
  );
}
