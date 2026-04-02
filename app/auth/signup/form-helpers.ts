import { checkProfanity } from '@/lib/profanity';

export type ValidationState = {
  message: string;
  isValid: boolean | null;
};

export type SignupFormData = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  contact: string;
  address: string;
  detailAddress: string;
  job: string;
};

export type SignupAgreements = {
  terms: boolean;
  privacy: boolean;
};

export const STEPS = [
  { number: 1, title: '계정 정보', description: '로그인에 사용할 이메일과 비밀번호를 입력해주세요.' },
  { number: 2, title: '개인 정보', description: '활동에 사용할 닉네임과 연락처를 입력해주세요.' },
  { number: 3, title: '추가 정보', description: '주소와 직업/소속기관 정보를 입력해주세요.' },
] as const;

export function getEmailFormatState(email: string): ValidationState {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { message: '', isValid: null };
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  return {
    isValid,
    message: isValid ? '올바른 이메일 형식입니다. 중복확인을 진행해 주세요.' : '올바른 이메일 형식이 아닙니다.',
  };
}

export function getNicknameFormatState(nickname: string): ValidationState {
  const normalizedNickname = nickname.trim();

  if (!normalizedNickname) {
    return { message: '', isValid: null };
  }

  if (normalizedNickname.length < 2 || normalizedNickname.length > 10) {
    return { message: '닉네임은 2자 이상 10자 이하여야 합니다.', isValid: false };
  }

  if (!/^[가-힣a-zA-Z0-9]+$/.test(normalizedNickname)) {
    return { message: '닉네임에는 특수문자나 기호를 사용할 수 없습니다.', isValid: false };
  }

  if (checkProfanity(normalizedNickname)) {
    return { message: '사용할 수 없는 단어가 포함되어 있습니다.', isValid: false };
  }

  return { message: '사용 가능한 형식입니다. 중복확인을 진행해 주세요.', isValid: true };
}

export function isValidPassword(value: string) {
  return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(value);
}

export function formatContactValue(contact: string) {
  let value = contact.replace(/[^0-9]/g, '');

  if (value.length > 3 && value.length <= 7) {
    value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
  } else if (value.length > 7) {
    value = value.replace(/(\d{3})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
  }

  return value;
}

export function isValidContact(contact: string) {
  return /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/.test(contact);
}
