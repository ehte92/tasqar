import { cn, generateToken, isValidToken } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2', { class3: true, class4: false });
      expect(result).toBe('class1 class2 class3');
    });
  });

  describe('generateToken', () => {
    it('should generate a non-empty string token', () => {
      const token = generateToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('isValidToken', () => {
    it('should return true for a future date', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day in the future
      expect(isValidToken(futureDate)).toBe(true);
    });

    it('should return false for a past date', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day in the past
      expect(isValidToken(pastDate)).toBe(false);
    });

    it('should return false for the current date', () => {
      const currentDate = new Date().toISOString();
      expect(isValidToken(currentDate)).toBe(false);
    });
  });
});
