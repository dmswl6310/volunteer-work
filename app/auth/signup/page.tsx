'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkEmailExists, checkNicknameExists } from '@/actions/auth';

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

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    contact: '',
    address: '',
    job: '',
  });

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
      // 간단한 이메일 형식 검사
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

  // 닉네임 실시간 검사
  useEffect(() => {
    const validateNickname = async () => {
      if (!debouncedNickname) {
        setNicknameStatus({ message: '', isValid: null });
        return;
      }
      if (debouncedNickname.length < 2) {
        setNicknameStatus({ message: '닉네임은 2자 이상이어야 합니다.', isValid: false });
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

  const isFormValid = 
    emailStatus.isValid === true &&
    nicknameStatus.isValid === true &&
    passwordMatch.isValid === true &&
    formData.password.length >= 6 &&
    formData.contact &&
    formData.address &&
    formData.job;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; // 버튼이 비활성화되지만 만약을 위해 방어

    setLoading(true);
    setError(null);

    try {
      // Supabase Auth SignUp
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
        // 서버 액션을 통한 유저 레코드 생성
        const { createUserRecord } = await import('@/actions/auth');

        const result = await createUserRecord({
          id: authData.user.id,
          email: formData.email,
          username: formData.nickname,
          name: formData.nickname, // 이름은 닉네임과 동일하게 임시 설정
          contact: formData.contact,
          address: formData.address,
          job: formData.job
        });

        if (!result.success) {
          await supabase.auth.signOut();
          setError(result.error || '회원가입 처리 중 문제가 발생했습니다.');
          setLoading(false);
          return;
        }

        // 승인 대기 상태이므로 로그아웃 처리
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 pb-20">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">회원가입</h2>
          <p className="mt-2 text-sm text-gray-600">
            관리자 승인 후 이용 가능합니다.
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 (아이디)</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                emailStatus.isValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                emailStatus.isValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={handleChange}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
            {formData.password.length > 0 && formData.password.length < 6 && (
              <p className="mt-1 text-xs text-red-500">비밀번호는 최소 6자 이상이어야 합니다.</p>
            )}
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                passwordMatch.isValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                passwordMatch.isValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : 'border-gray-300'
              }`}
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
            {passwordMatch.message && (
              <p className={`mt-1 text-xs ${passwordMatch.isValid ? 'text-green-600' : 'text-red-500'}`}>
                {passwordMatch.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">닉네임</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                nicknameStatus.isValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                nicknameStatus.isValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : 'border-gray-300'
              }`}
              value={formData.nickname}
              onChange={handleChange}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">주소</label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.job}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '가입 처리 중...' : '가입하기'}
            </button>
            {!isFormValid && !loading && (
              <p className="text-center text-xs text-gray-500 mt-2">
                모든 항목을 올바르게 입력해야 가입이 가능합니다.
              </p>
            )}
          </div>

          <div className="text-center text-sm pt-2">
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
