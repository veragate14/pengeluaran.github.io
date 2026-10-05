/**
 * Formats a number to Indonesian Rupiah currency format.
 * e.g., 7000000 -> "Rp 7.000.000"
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats date into readable Indonesian format
 * e.g., "2026-10-05" -> "Senin, 5 Oktober 2026"
 */
export const formatDateIndo = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Returns a friendly relative label: "Hari ini", "Kemarin", or date
 */
export const getRelativeDateLabel = (dateStr: string): string => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return 'Hari Ini';
  } else if (dateStr === yesterdayStr) {
    return 'Kemarin';
  }
  return formatDateIndo(dateStr);
};

/**
 * Get current date string in YYYY-MM-DD
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current time string in HH:mm
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
