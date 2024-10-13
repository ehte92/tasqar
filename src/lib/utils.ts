import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a secure random token for invitation purposes.
 * @returns {string} A random token string.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Validates if a given token is not expired.
 * @param {string} expirationDate - The expiration date of the token in ISO format.
 * @returns {boolean} True if the token is still valid, false otherwise.
 */
export function isValidToken(expirationDate: string): boolean {
  const expiration = new Date(expirationDate);
  return expiration > new Date();
}
