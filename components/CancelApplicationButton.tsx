'use client';

import { cancelApplication } from '@/actions/apply';
import { useState } from 'react';

/** 신청 취소 버튼 컴포넌트 */
export default function CancelApplicationButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('신청을 취소하시겠습니까?')) return;
    setLoading(true);
    try {
      await cancelApplication(applicationId);
      alert('취소되었습니다.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
        onClick={handleCancel}
        disabled={loading}
        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
    >
        취소
    </button>
  );
}
