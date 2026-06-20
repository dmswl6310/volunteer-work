'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/** Toast 메시지 타입 */
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
};

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | null>(null);

/** Toast 알림을 사용하기 위한 훅 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

/** Toast 알림 Provider 및 UI 컴포넌트 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);

    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const showConfirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        title: options?.title ?? '한 번 더 확인해 주세요',
        message,
        confirmLabel: options?.confirmLabel ?? '확인',
        cancelLabel: options?.cancelLabel ?? '취소',
        resolve,
      });
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirmClose = (confirmed: boolean) => {
    if (!confirmState) return;
    confirmState.resolve(confirmed);
    setConfirmState(null);
  };

  const typeStyles: Record<ToastType, string> = {
    success: 'border border-emerald-200 bg-white text-slate-900',
    error: 'border border-rose-200 bg-white text-slate-900',
    info: 'border border-amber-200 bg-white text-slate-900',
    warning: 'border border-amber-200 bg-white text-slate-900',
  };

  const typeIcons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {confirmState && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
            <h3 className="text-lg font-semibold text-slate-900">{confirmState.title}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{confirmState.message}</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className="flex-1 rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 컨테이너 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-slide-down flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_14px_30px_rgba(15,23,42,0.12)] ${typeStyles[toast.type]}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : toast.type === 'error' ? 'bg-rose-50 text-rose-600' : toast.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-amber-50 text-amber-600'}`}>{typeIcons[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
