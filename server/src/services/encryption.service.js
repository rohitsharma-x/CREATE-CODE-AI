const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

const getSecretKey = () => {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || 'createcode_default_32byte_encryption_secret_key_!';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: iv:tag:ciphertext (hex encoded)
 */
const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt an AES-256-GCM encrypted string.
 */
const decrypt = (encryptedString) => {
  if (!encryptedString) return null;
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};

