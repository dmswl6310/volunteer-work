'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkEmailExists, checkNicknameExists, registerUser } from '@/actions/auth';
import { checkProfanity } from '@/lib/profanity';
import { useToast } from '@/components/ToastProvider';
import SignupProgress from '@/app/auth/signup/_components/SignupProgress';
import SignupAccountStep from '@/app/auth/signup/_components/SignupAccountStep';
import SignupProfileStep from '@/app/auth/signup/_components/SignupProfileStep';
import SignupExtraStep from '@/app/auth/signup/_components/SignupExtraStep';
import AddressSearchModal from '@/app/auth/signup/_components/AddressSearchModal';
import {
  formatContactValue,
  getEmailFormatState,
  getNicknameFormatState,
  isValidContact,
  isValidPassword,
  type SignupAgreements,
  type SignupFormData,
  type ValidationState,
} from '@/app/auth/signup/form-helpers';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    contact: '',
    address: '',
    detailAddress: '',
    job: '',
  });

  const [agreements, setAgreements] = useState<SignupAgreements>({
    terms: false,
    privacy: false,
  });

  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  // 유효성 검사 상태
  const [emailStatus, setEmailStatus] = useState<ValidationState>({ message: '', isValid: null });
  const [nicknameStatus, setNicknameStatus] = useState<ValidationState>({ message: '', isValid: null });
  const [passwordMatch, setPasswordMatch] = useState<ValidationState>({ message: '', isValid: null });
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailFormatState = getEmailFormatState(formData.email);
  const emailFormatMessage = emailFormatState.message;
  const isEmailFormatValid = emailFormatState.isValid;

  const nicknameFormatState = getNicknameFormatState(formData.nickname);
  const nicknameFormatMessage = nicknameFormatState.message;
  const isNicknameFormatValid = nicknameFormatState.isValid;

  const validateEmailValue = async (email: string) => {
    if (!email) return false;

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setEmailStatus({ message: '올바른 이메일 형식이 아닙니다.', isValid: false });
      return false;
    }

    setIsCheckingEmail(true);
    setEmailStatus({ message: '이메일 중복 여부를 확인하고 있습니다...', isValid: null });

    const res = await checkEmailExists(normalizedEmail);
    setIsCheckingEmail(false);
    if (res.exists) {
      setEmailStatus({ message: res.message, isValid: false });
      return false;
    }

    setEmailStatus({ message: res.message, isValid: true });
    return true;
  };

  // 비밀번호 정규식 (8자 이상, 영문/숫자/특수문자 포함)
  const passwordIsValid = isValidPassword(formData.password);

  const validateNicknameValue = async (nickname: string) => {
    if (!nickname) return false;
    const normalizedNickname = nickname.trim();
    if (normalizedNickname.length < 2 || normalizedNickname.length > 10) {
      setNicknameStatus({ message: '닉네임은 2자 이상 10자 이하여야 합니다.', isValid: false });
      return false;
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(normalizedNickname)) {
      setNicknameStatus({ message: '닉네임에는 특수문자나 기호를 사용할 수 없습니다.', isValid: false });
      return false;
    }
    if (checkProfanity(normalizedNickname)) {
      setNicknameStatus({ message: '사용할 수 없는 단어가 포함되어 있습니다.', isValid: false });
      return false;
    }

    setIsCheckingNickname(true);
    setNicknameStatus({ message: '닉네임 중복 여부를 확인하고 있습니다...', isValid: null });

    const res = await checkNicknameExists(normalizedNickname);
    setIsCheckingNickname(false);
    if (res.exists) {
      setNicknameStatus({ message: res.message, isValid: false });
      return false;
    }

    setNicknameStatus({ message: res.message, isValid: true });
    return true;
  };

  // 비밀번호 확인 실시간 검사
  useEffect(() => {
    if (!formData.password || !formData.passwordConfirm) {
      setPasswordMatch({ message: '', isValid: null });
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setPasswordMatch({ message: '비밀번호가 일치하지 않습니다.', isValid: false });
    } else {
      setPasswordMatch({ message: '비밀번호가 일치합니다.', isValid: true });
    }
  }, [formData.password, formData.passwordConfirm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.name === 'email' ? e.target.value.trim().toLowerCase() : e.target.value;
    if (e.target.name === 'email') {
      setEmailStatus({ message: '', isValid: null });
    }
    if (e.target.name === 'nickname') {
      setNicknameStatus({ message: '', isValid: null });
    }
    setFormData({ ...formData, [e.target.name]: nextValue });
  };

  // 연락처 자동 하이픈
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, contact: formatContactValue(e.target.value) });
  };

  // 단계별 유효성 검사
  const isStep1Valid =
    !isCheckingEmail &&
    isEmailFormatValid === true &&
    emailStatus.isValid === true &&
    passwordIsValid &&
    passwordMatch.isValid === true;

  const contactIsValid = isValidContact(formData.contact);

  const isStep2Valid =
    !isCheckingNickname &&
    isNicknameFormatValid === true &&
    nicknameStatus.isValid === true &&
    contactIsValid;

  const isStep3Valid =
    formData.address.length > 0 &&
    formData.job.length > 0 &&
    agreements.terms &&
    agreements.privacy;

  const isCurrentStepValid = step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : isStep3Valid;

  // 단계 전환 핸들러
  const goToStep = (nextStep: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setFadeIn(true);
    }, 200);
  };

  const handleNext = async () => {
    setError(null);
    let canProceed = isCurrentStepValid;

    if (step === 1) {
      canProceed = isEmailFormatValid === true && emailStatus.isValid === true && passwordIsValid && passwordMatch.isValid === true;
    }

    if (step === 2) {
      canProceed = isNicknameFormatValid === true && nicknameStatus.isValid === true && contactIsValid;
    }

    if (step < 3 && canProceed) {
      goToStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      goToStep(step - 1);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) return;

    setLoading(true);
    setError(null);

    try {
      const [isEmailAvailable, isNicknameAvailable] = await Promise.all([
        validateEmailValue(formData.email),
        validateNicknameValue(formData.nickname),
      ]);

      if (!isEmailAvailable || !isNicknameAvailable) {
        setError('입력한 이메일 또는 닉네임을 다시 확인해 주세요.');
        setLoading(false);
        return;
      }

      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        username: formData.nickname,
        contact: formData.contact,
        address: `${formData.address} ${formData.detailAddress}`.trim(),
        job: formData.job,
      });

      if (!result.success) {
        if (result.fieldErrors?.email) {
          setEmailStatus({ message: result.fieldErrors.email, isValid: false });
        }
        if (result.fieldErrors?.username) {
          setNicknameStatus({ message: result.fieldErrors.username, isValid: false });
        }
        setError(result.error || '회원가입 처리 중 문제가 발생했습니다.');
        return;
      }

      showToast('회원가입 요청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.', 'success');
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: unknown) {
      console.error(err);
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 인풋 공통 스타일
  const inputBase = 'mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors';
  const inputNormal = `${inputBase} border-gray-300`;

  const getValidationInputClass = (status: { isValid: boolean | null }) => {
    if (status.isValid === false) return `${inputBase} border-red-300 focus:ring-red-500 focus:border-red-500`;
    if (status.isValid === true) return `${inputBase} border-green-300 focus:ring-green-500 focus:border-green-500`;
    return inputNormal;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 pb-20">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">회원가입</h2>
          <p className="mt-1 text-sm text-gray-500">
            관리자 승인 후 이용 가능합니다.
          </p>
        </div>

        {/* Progress Indicator */}
        <SignupProgress step={step} />

        <form onSubmit={handleSignup}>
          {/* 스텝 컨텐츠 영역 */}
          <div className={`transition-all duration-200 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            
            {/* ========== STEP 1: 계정 정보 ========== */}
            {step === 1 && (
              <SignupAccountStep
                formData={formData}
                emailStatus={emailStatus}
                emailFormatMessage={emailFormatMessage}
                isEmailFormatValid={isEmailFormatValid}
                isCheckingEmail={isCheckingEmail}
                passwordMatch={passwordMatch}
                isPasswordValid={passwordIsValid}
                inputNormal={inputNormal}
                getValidationInputClass={getValidationInputClass}
                onChange={handleChange}
                onValidateEmail={() => void validateEmailValue(formData.email)}
              />
            )}

            {/* ========== STEP 2: 개인 정보 ========== */}
            {step === 2 && (
              <SignupProfileStep
                formData={formData}
                nicknameStatus={nicknameStatus}
                nicknameFormatMessage={nicknameFormatMessage}
                isNicknameFormatValid={isNicknameFormatValid}
                isCheckingNickname={isCheckingNickname}
                isContactValid={contactIsValid}
                inputNormal={inputNormal}
                getValidationInputClass={getValidationInputClass}
                onChange={handleChange}
                onContactChange={handleContactChange}
                onValidateNickname={() => void validateNicknameValue(formData.nickname)}
              />
            )}

            {/* ========== STEP 3: 추가 정보 ========== */}
            {step === 3 && (
              <SignupExtraStep
                formData={formData}
                agreements={agreements}
                inputNormal={inputNormal}
                onChange={handleChange}
                onOpenPostcode={() => setIsPostcodeOpen(true)}
                onAgreementChange={(key, value) => setAgreements((prev) => ({ ...prev, [key]: value }))}
              />
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg mt-4">{error}</div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="mt-8 space-y-3">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                >
                  이전
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  disabled={!isCurrentStepValid}
                  onClick={() => void handleNext()}
                  className="flex-1 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  다음
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isStep3Valid}
                  className="flex-1 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '가입 처리 중...' : '가입하기'}
                </button>
              )}
            </div>

            <div className="text-center text-sm pt-1">
              <Link href="/" className="font-medium text-amber-600 hover:text-amber-500">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
        </form>
      </div>

      <AddressSearchModal
        open={isPostcodeOpen}
        onClose={() => setIsPostcodeOpen(false)}
        onComplete={(address) => {
          setFormData((prev) => ({ ...prev, address }));
          setIsPostcodeOpen(false);
        }}
      />
    </div>
  );
}
