/**
 * 봉사활동 카테고리 목록 (게시글 작성/수정/필터에서 공통 사용)
 */
export const CATEGORIES = [
  '긴급재난구호',
  '의료',
  '노인돌봄',
  '이주민',
  '청소년',
  '환경',
  '어린이 밥상',
  '인문학',
  '예술',
] as const;

/** 카테고리 타입 */
export type Category = (typeof CATEGORIES)[number];
