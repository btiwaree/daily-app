import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Encrypts a token using AES-256-GCM
 * @param token - The plaintext token to encrypt
 * @param key - The encryption key (base64 encoded, must be 32 bytes when decoded)
 * @returns Base64 encoded string containing: IV + authTag + encryptedData
 */
export function encryptToken(token: string, key: string): string {
  if (!token) {
    throw new Error('Token cannot be empty');
  }

  // Decode the base64 key
  const keyBuffer = Buffer.from(key, 'base64');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters or base64 encoded)`,
    );
  }

  // Generate a random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  // Encrypt the token
  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ]);

  // Return as base64 string
  return combined.toString('base64');
}

/**
 * Decrypts a token using AES-256-GCM
 * @param encryptedToken - The base64 encoded encrypted token (IV + authTag + encryptedData)
 * @param key - The decryption key (base64 encoded, must be 32 bytes when decoded)
 * @returns The decrypted plaintext token
 */
export function decryptToken(encryptedToken: string, key: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty');
  }

  // Decode the base64 key
  const keyBuffer = Buffer.from(key, 'base64');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `Decryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters or base64 encoded)`,
    );
  }

  // Decode the combined data
  const combined = Buffer.from(encryptedToken, 'base64');

  // Extract IV, authTag, and encrypted data
  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encryptedData = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  // Decrypt the token
  let decrypted = decipher.update(encryptedData, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
