import { check } from 'korcen';

/**
 * 텍스트에 욕설이 포함되어 있는지 검사합니다.
 * 원본 텍스트와 공백·특수문자를 제거한 텍스트 모두 검사하여 우회를 방지합니다.
 */
export function checkProfanity(text: string): boolean {
    if (!text || text.trim().length === 0) return false;

    // 원본 텍스트 검사
    if (check(text)) return true;

    // 공백 및 특수문자 제거 후 재검사 (우회 방지)
    const sanitized = text
        .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/gi, '')
        .replace(/\s+/g, '');

    if (sanitized.length > 0 && check(sanitized)) return true;

    return false;
}

/**
 * 여러 필드를 한 번에 검사하여 첫 번째로 감지된 필드에 대한 에러 메시지를 반환합니다.
 * 욕설이 없으면 null을 반환합니다.
 */
export function validateNoProfanity(
    ...fields: { label: string; value: string }[]
): string | null {
    for (const field of fields) {
        if (checkProfanity(field.value)) {
            return `${field.label}에 부적절한 표현이 포함되어 있습니다.`;
        }
    }
    return null;
}
