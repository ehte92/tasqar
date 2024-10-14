export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';

  const dateObject = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
    return 'Invalid Date';
  }

  return dateObject.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
