/**
 * 봉사활동 카테고리 목록 (게시글 작성/수정/필터에서 공통 사용)
 */
export const CATEGORIES = ['교육', '환경', '의료', '동물', '문화', '기타'] as const;

/** 카테고리 타입 */
export type Category = (typeof CATEGORIES)[number];
