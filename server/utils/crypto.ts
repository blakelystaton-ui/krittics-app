/**
 * crypto.ts
 * 
 * Cryptographic utility functions
 */

import crypto from "crypto";

/**
 * Generate a SHA-256 hash from a string
 */
export function generateSHA256Hash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate a random UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
