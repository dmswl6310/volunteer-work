'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkEmailExists, checkNicknameExists } from '@/actions/auth';
import { checkProfanity } from '@/lib/profanity';
import { Check, X } from 'lucide-react';
import type { Address } from 'react-daum-postcode';
import dynamic from 'next/dynamic';

const DaumPostcode = dynamic(() => import('react-daum-postcode'), { 
  ssr: false,
  loading: () => <div className="p-10 text-center text-sm text-gray-500">주소 검색 화면을 불러오는 중입니다...</div>
});

// 간단한 useDebounce 훅 내부 구현
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const STEPS = [
  { number: 1, title: '계정 정보', description: '로그인에 사용할 이메일과 비밀번호를 입력해주세요.' },
  { number: 2, title: '개인 정보', description: '활동에 사용할 닉네임과 연락처를 입력해주세요.' },
  { number: 3, title: '추가 정보', description: '주소와 직업/소속기관 정보를 입력해주세요.' },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    contact: '',
    address: '',
    detailAddress: '',
    job: '',
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  // 유효성 검사 상태
  const [emailStatus, setEmailStatus] = useState<{ message: string; isValid: boolean | null }>({ message: '', isValid: null });
  const [nicknameStatus, setNicknameStatus] = useState<{ message: string; isValid: boolean | null }>({ message: '', isValid: null });
  const [passwordMatch, setPasswordMatch] = useState<{ message: string; isValid: boolean | null }>({ message: '', isValid: null });
  const [error, setError] = useState<string | null>(null);

  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedNickname = useDebounce(formData.nickname, 500);

  // 이메일 실시간 검사
  useEffect(() => {
    const validateEmail = async () => {
      if (!debouncedEmail) {
        setEmailStatus({ message: '', isValid: null });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(debouncedEmail)) {
        setEmailStatus({ message: '올바른 이메일 형식이 아닙니다.', isValid: false });
        return;
      }
      
      const res = await checkEmailExists(debouncedEmail);
      if (res.exists) {
        setEmailStatus({ message: res.message, isValid: false });
      } else {
        setEmailStatus({ message: res.message, isValid: true });
      }
    };
    validateEmail();
  }, [debouncedEmail]);

  // 비밀번호 정규식 (8자 이상, 영문/숫자/특수문자 포함)
  const isPasswordValid = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(formData.password);

  // 닉네임 실시간 검사
  useEffect(() => {
    const validateNickname = async () => {
      if (!debouncedNickname) {
        setNicknameStatus({ message: '', isValid: null });
        return;
      }
      if (debouncedNickname.length < 2 || debouncedNickname.length > 10) {
        setNicknameStatus({ message: '닉네임은 2자 이상 10자 이하여야 합니다.', isValid: false });
        return;
      }
      if (!/^[가-힣a-zA-Z0-9]+$/.test(debouncedNickname)) {
        setNicknameStatus({ message: '닉네임에는 특수문자나 기호를 사용할 수 없습니다.', isValid: false });
        return;
      }
      if (checkProfanity(debouncedNickname)) {
        setNicknameStatus({ message: '사용할 수 없는 단어가 포함되어 있습니다.', isValid: false });
        return;
      }
      
      const res = await checkNicknameExists(debouncedNickname);
      if (res.exists) {
        setNicknameStatus({ message: res.message, isValid: false });
      } else {
        setNicknameStatus({ message: res.message, isValid: true });
      }
    };
    validateNickname();
  }, [debouncedNickname]);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 연락처 자동 하이픈
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 3 && value.length <= 7) {
      value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    } else if (value.length > 7) {
      value = value.replace(/(\d{3})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
    }
    setFormData({ ...formData, contact: value });
  };

  // 단계별 유효성 검사
  const isStep1Valid =
    emailStatus.isValid === true &&
    isPasswordValid &&
    passwordMatch.isValid === true;

  const isContactValid = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/.test(formData.contact);

  const isStep2Valid =
    nicknameStatus.isValid === true &&
    isContactValid;

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

  const handleNext = () => {
    if (step < 3 && isCurrentStepValid) {
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.nickname,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { createUserRecord } = await import('@/actions/auth');

        const result = await createUserRecord({
          id: authData.user.id,
          email: formData.email,
          username: formData.nickname,
          name: formData.nickname,
          contact: formData.contact,
          address: `${formData.address} ${formData.detailAddress}`.trim(),
          job: formData.job
        });

        if (!result.success) {
          await supabase.auth.signOut();
          setError(result.error || '회원가입 처리 중 문제가 발생했습니다.');
          setLoading(false);
          return;
        }

        await supabase.auth.signOut();

        alert('회원가입 요청이 접수되었습니다!\n관리자 승인 완료 후 로그인할 수 있습니다.');
        router.push('/');
      }
    } catch (err: any) {
      if (err.message?.includes('User already registered') || err.message?.includes('already registered')) {
        setError('이미 존재하는 계정입니다.');
      } else {
        console.error(err);
        setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 인풋 공통 스타일
  const inputBase = 'mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors';
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
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            {STEPS.map((s, i) => (
              <div key={s.number} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                {/* 원형 번호 */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-all duration-300 ${
                  step > s.number 
                    ? 'bg-indigo-600 text-white'
                    : step === s.number
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.number ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    s.number
                  )}
                </div>
                {/* 연결선 */}
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    step > s.number ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          {/* 현재 단계 설명 */}
          <div className="text-center mt-3">
            <p className="text-sm font-semibold text-indigo-600">{STEPS[step - 1].title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{STEPS[step - 1].description}</p>
          </div>
        </div>

        <form onSubmit={handleSignup}>
          {/* 스텝 컨텐츠 영역 */}
          <div className={`transition-all duration-200 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            
            {/* ========== STEP 1: 계정 정보 ========== */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 (아이디)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={getValidationInputClass(emailStatus)}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                  {emailStatus.message && (
                    <p className={`mt-1 text-xs ${emailStatus.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {emailStatus.message}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="비밀번호를 한번 더 입력해주세요"
                  />
                  {passwordMatch.message && (
                    <p className={`mt-1 text-xs ${passwordMatch.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordMatch.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ========== STEP 2: 개인 정보 ========== */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">닉네임</label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    required
                    className={getValidationInputClass(nicknameStatus)}
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="2자 이상의 닉네임을 입력해주세요"
                  />
                  {nicknameStatus.message && (
                    <p className={`mt-1 text-xs ${nicknameStatus.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {nicknameStatus.message}
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
                    className={formData.contact.length > 0 && !isContactValid ? getValidationInputClass({ isValid: false }) : inputNormal}
                    value={formData.contact}
                    onChange={handleContactChange}
                    placeholder="010-0000-0000"
                  />
                  {formData.contact.length > 0 && !isContactValid && (
                    <p className="mt-1 text-xs text-red-500">올바른 연락처 형식이 아닙니다.</p>
                  )}
                </div>
              </div>
            )}

            {/* ========== STEP 3: 추가 정보 ========== */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">주소</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder="주소 검색을 눌러주세요"
                      required
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-900 font-medium focus:outline-none sm:text-sm cursor-not-allowed"
                      value={formData.address}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPostcodeOpen(true)}
                      className="whitespace-nowrap px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="예: 학생, 직장인, OO대학교"
                  />
                </div>

                {/* 약관 동의 */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.terms}
                        onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-colors"
                        required
                      />
                      <span className="text-sm font-medium text-gray-700">[필수] 서비스 이용약관 동의</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.privacy}
                        onChange={(e) => setAgreements({ ...agreements, privacy: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-colors"
                        required
                      />
                      <span className="text-sm font-medium text-gray-700">[필수] 개인정보 수집 및 이용 동의</span>
                    </label>
                  </div>
                  {(!agreements.terms || !agreements.privacy) && (
                    <p className="mt-3 text-xs text-red-500 font-medium">모든 필수 약관에 동의해야 가입할 수 있습니다.</p>
                  )}
                </div>
              </div>
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
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  이전
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  className="flex-1 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  다음
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isStep3Valid}
                  className="flex-1 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '가입 처리 중...' : '가입하기'}
                </button>
              )}
            </div>

            <div className="text-center text-sm pt-1">
              <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* 우편번호 검색 팝업 (모달) */}
      {isPostcodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">주소 검색</h3>
              <button 
                type="button"
                onClick={() => setIsPostcodeOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
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

                  setFormData({ ...formData, address: fullAddress });
                  setIsPostcodeOpen(false);
                }}
                autoClose={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
