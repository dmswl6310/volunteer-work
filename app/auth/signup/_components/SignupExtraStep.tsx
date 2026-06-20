import type { ChangeEvent } from 'react';
import type { SignupAgreements, SignupFormData } from '@/app/auth/signup/form-helpers';

type SignupExtraStepProps = {
  formData: SignupFormData;
  agreements: SignupAgreements;
  inputNormal: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenPostcode: () => void;
  onAgreementChange: (key: keyof SignupAgreements, value: boolean) => void;
};

export default function SignupExtraStep({
  formData,
  agreements,
  inputNormal,
  onChange,
  onOpenPostcode,
  onAgreementChange,
}: SignupExtraStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">주소</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            readOnly
            placeholder="주소 검색을 눌러주세요"
            required
            className="block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-900 font-medium shadow-sm focus:outline-none sm:text-sm"
            value={formData.address}
          />
          <button
            type="button"
            onClick={onOpenPostcode}
            className="whitespace-nowrap rounded-lg border border-transparent bg-gray-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            주소 검색
          </button>
        </div>
        <input
          name="detailAddress"
          type="text"
          placeholder="상세 주소 (예: 101동 202호)"
          className={`mt-2 ${inputNormal}`}
          value={formData.detailAddress}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="job" className="block text-sm font-medium text-gray-700">직업 / 소속기관</label>
        <input
          id="job"
          name="job"
          type="text"
          required
          className={inputNormal}
          value={formData.job}
          onChange={onChange}
          placeholder="예: 학생, 직장인, OO대학교"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center space-x-3">
            <input
              type="checkbox"
              checked={agreements.terms}
              onChange={(event) => onAgreementChange('terms', event.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-amber-600 transition-colors focus:ring-amber-500"
              required
            />
            <span className="text-sm font-medium text-gray-700">[필수] 서비스 이용약관 동의</span>
          </label>
          <label className="flex cursor-pointer items-center space-x-3">
            <input
              type="checkbox"
              checked={agreements.privacy}
              onChange={(event) => onAgreementChange('privacy', event.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-amber-600 transition-colors focus:ring-amber-500"
              required
            />
            <span className="text-sm font-medium text-gray-700">[필수] 개인정보 수집 및 이용 동의</span>
          </label>
        </div>
        {(!agreements.terms || !agreements.privacy) && (
          <p className="mt-3 text-xs font-medium text-red-500">모든 필수 약관에 동의해야 가입할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
