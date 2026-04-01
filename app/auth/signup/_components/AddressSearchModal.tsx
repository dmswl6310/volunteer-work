'use client';

import dynamic from 'next/dynamic';
import type { Address } from 'react-daum-postcode';
import { X } from 'lucide-react';

const DaumPostcode = dynamic(() => import('react-daum-postcode'), {
  ssr: false,
  loading: () => <div className="p-10 text-center text-sm text-gray-500">주소 검색 화면을 불러오는 중입니다...</div>,
});

type AddressSearchModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (address: string) => void;
};

export default function AddressSearchModal({ open, onClose, onComplete }: AddressSearchModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-bold">주소 검색</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-6 w-6" />
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

              onComplete(fullAddress);
            }}
            autoClose={false}
          />
        </div>
      </div>
    </div>
  );
}
