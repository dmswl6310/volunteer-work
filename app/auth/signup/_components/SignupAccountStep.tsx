import type { ChangeEvent } from 'react';
import type { SignupFormData, ValidationState } from '@/app/auth/signup/form-helpers';

type SignupAccountStepProps = {
  formData: SignupFormData;
  emailStatus: ValidationState;
  emailFormatMessage: string;
  isEmailFormatValid: boolean | null;
  isCheckingEmail: boolean;
  passwordMatch: ValidationState;
  isPasswordValid: boolean;
  inputNormal: string;
  getValidationInputClass: (status: ValidationState) => string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onValidateEmail: () => void;
};

export default function SignupAccountStep({
  formData,
  emailStatus,
  emailFormatMessage,
  isEmailFormatValid,
  isCheckingEmail,
  passwordMatch,
  isPasswordValid,
  inputNormal,
  getValidationInputClass,
  onChange,
  onValidateEmail,
}: SignupAccountStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 (아이디)</label>
        <div className="mt-1 flex gap-2">
          <input
            id="email"
            name="email"
            type="email"
            required
            className={`${getValidationInputClass(emailStatus)} mt-0 flex-1`}
            value={formData.email}
            onChange={onChange}
            placeholder="example@email.com"
          />
          <button
            type="button"
            onClick={onValidateEmail}
            disabled={isEmailFormatValid !== true || isCheckingEmail}
            className="shrink-0 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
          >
            {isCheckingEmail ? '확인 중' : '중복확인'}
          </button>
        </div>
        {(emailStatus.message || emailFormatMessage) && (
          <p className={`mt-1 text-xs ${emailStatus.isValid ? 'text-green-600' : isCheckingEmail ? 'text-gray-500' : isEmailFormatValid === false ? 'text-red-500' : 'text-gray-500'}`}>
            {emailStatus.message || emailFormatMessage}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={inputNormal}
          value={formData.password}
          onChange={onChange}
          placeholder="6자 이상 입력해주세요"
        />
        {formData.password.length > 0 && !isPasswordValid && (
          <p className="mt-1 text-xs text-red-500">8자 이상, 영문/숫자/특수문자를 포함해야 합니다.</p>
        )}
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          className={getValidationInputClass(passwordMatch)}
          value={formData.passwordConfirm}
          onChange={onChange}
          placeholder="비밀번호를 한번 더 입력해주세요"
        />
        {passwordMatch.message && (
          <p className={`mt-1 text-xs ${passwordMatch.isValid ? 'text-green-600' : 'text-red-500'}`}>
            {passwordMatch.message}
          </p>
        )}
      </div>
    </div>
  );
}
