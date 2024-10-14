import { formatDate } from '@/lib/utils/date';

describe('formatDate', () => {
  it('should format a valid Date object correctly', () => {
    const date = new Date('2023-05-15T12:00:00Z');
    expect(formatDate(date)).toBe('May 15, 2023');
  });

  it('should format a valid date string correctly', () => {
    const dateString = '2023-05-15T12:00:00Z';
    expect(formatDate(dateString)).toBe('May 15, 2023');
  });

  it('should return "-" for null input', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('should return "-" for undefined input', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('should return "Invalid Date" for an invalid date string', () => {
    expect(formatDate('not a date')).toBe('Invalid Date');
  });

  it('should return "Invalid Date" for an invalid Date object', () => {
    const invalidDate = new Date('invalid');
    expect(formatDate(invalidDate)).toBe('Invalid Date');
  });
});
