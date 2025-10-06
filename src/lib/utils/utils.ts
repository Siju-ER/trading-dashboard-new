export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Date utility functions to handle timezone issues
export function getLocalDateString(date: Date): string {
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return getLocalDateString(date) === getLocalDateString(today);
}

export function getTodayLocal(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function formatDateLocal(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}