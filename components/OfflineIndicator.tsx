'use client';

import { useEffect } from 'react';
import { useToast } from './ToastProvider';

/**
 * 전역 오프라인 상태 감지 컴포넌트
 * 인터넷 연결이 끊기거나 다시 연결될 때 Toast 알림을 띄웁니다.
 */
export default function OfflineIndicator() {
  const { showToast } = useToast();

  useEffect(() => {
    let offlineTimeoutiza: NodeJS.Timeout;
    let isOfflineToastShown = false;

    const handleOffline = () => {
      // 바로 띄우지 않고 2초(2000ms) 대기
      offlineTimeoutiza = setTimeout(() => {
        isOfflineToastShown = true;
        showToast('인터넷 연결이 끊겼습니다. 오프라인 상태입니다.', 'error');
      }, 2000);
    };

    const handleOnline = () => {
      // 2초 안에 온라인으로 다시 돌아오면 오프라인 알림 취소
      if (offlineTimeoutiza) {
        clearTimeout(offlineTimeoutiza);
      }
      
      // 오프라인 알림이 실제로 화면에 떴던 경우에만 복구 알림 표시
      if (isOfflineToastShown) {
        showToast('인터넷이 다시 연결되었습니다.', 'success');
        isOfflineToastShown = false;
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      if (offlineTimeoutiza) clearTimeout(offlineTimeoutiza);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [showToast]);

  return null; // 화면에 그리는 요소는 없음 (이벤트 감지만 수행)
}
