function extractDatePart(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function getKstDateParts(value: Date | string) {
  if (typeof value === 'string') {
    const extractedDate = extractDatePart(value);
    if (extractedDate) {
      return extractedDate;
    }
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

export function getTodayKstKey() {
  return getKstDateParts(new Date());
}

export function getDateKstKey(value?: string | null) {
  if (!value) return null;
  return getKstDateParts(value);
}
