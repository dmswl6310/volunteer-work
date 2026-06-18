import type { ChangeEvent } from 'react';
import type { SignupFormData, ValidationState } from '@/app/auth/signup/form-helpers';

type SignupProfileStepProps = {
  formData: SignupFormData;
  nicknameStatus: ValidationState;
  nicknameFormatMessage: string;
  isNicknameFormatValid: boolean | null;
  isCheckingNickname: boolean;
  isContactValid: boolean;
  inputNormal: string;
  getValidationInputClass: (status: ValidationState) => string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onContactChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onValidateNickname: () => void;
};

export default function SignupProfileStep({
  formData,
  nicknameStatus,
  nicknameFormatMessage,
  isNicknameFormatValid,
  isCheckingNickname,
  isContactValid,
  inputNormal,
  getValidationInputClass,
  onChange,
  onContactChange,
  onValidateNickname,
}: SignupProfileStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">닉네임</label>
        <div className="mt-1 flex gap-2">
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            className={`${getValidationInputClass(nicknameStatus)} mt-0 flex-1`}
            value={formData.nickname}
            onChange={onChange}
            placeholder="2자 이상의 닉네임을 입력해주세요"
          />
          <button
            type="button"
            onClick={onValidateNickname}
            disabled={isNicknameFormatValid !== true || isCheckingNickname}
            className="shrink-0 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
          >
            {isCheckingNickname ? '확인 중' : '중복확인'}
          </button>
        </div>
        {(nicknameStatus.message || nicknameFormatMessage) && (
          <p className={`mt-1 text-xs ${nicknameStatus.isValid ? 'text-green-600' : isCheckingNickname ? 'text-gray-500' : isNicknameFormatValid === false ? 'text-red-500' : 'text-gray-500'}`}>
            {nicknameStatus.message || nicknameFormatMessage}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">연락처</label>
        <input
          id="contact"
          name="contact"
          type="text"
          required
          maxLength={13}
          className={formData.contact.length > 0 && !isContactValid ? getValidationInputClass({ message: '', isValid: false }) : inputNormal}
          value={formData.contact}
          onChange={onContactChange}
          placeholder="010-0000-0000"
        />
        {formData.contact.length > 0 && !isContactValid && (
          <p className="mt-1 text-xs text-red-500">올바른 연락처 형식이 아닙니다.</p>
        )}
      </div>
    </div>
  );
}
