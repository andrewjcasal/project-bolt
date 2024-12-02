import { TokenUsage } from './types';

const ENCRYPTION_KEY = 'ai-text-adventure-v1';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SALT_KEY = 'token-integrity-salt';

// Get or create a persistent salt
const getIntegritySalt = (): string => {
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    salt = crypto.randomUUID();
    localStorage.setItem(SALT_KEY, salt);
  }
  return salt;
};

export const encryptUsage = (usage: TokenUsage): string => {
  try {
    // Validate usage object before encryption
    if (!isValidUsage(usage)) {
      throw new Error('Invalid usage object');
    }

    const data = JSON.stringify(usage);
    const encoded = btoa(data);
    const timestamp = Date.now().toString(36);
    const signature = generateSignature(encoded, timestamp);
    
    // Add integrity hash using persistent salt
    const integrityHash = generateIntegrityHash(usage, getIntegritySalt());
    
    // Add a checksum to prevent tampering
    const checksum = generateChecksum(usage);
    return `${encoded}.${timestamp}.${signature}.${checksum}.${integrityHash}`;
  } catch (error) {
    console.error('Error encrypting usage:', error);
    throw error;
  }
};

export const decryptUsage = (encrypted: string): TokenUsage | null => {
  try {
    const [encoded, timestamp, signature, checksum, integrityHash] = encrypted.split('.');
    
    if (!encoded || !timestamp || !signature || !checksum || !integrityHash) {
      console.warn('Invalid encrypted data format');
      return null;
    }

    // Verify signature
    const expectedSignature = generateSignature(encoded, timestamp);
    if (signature !== expectedSignature) {
      console.warn('Invalid signature detected');
      return null;
    }

    // Verify timestamp
    const timestampNum = parseInt(timestamp, 36);
    if (Date.now() - timestampNum > MAX_AGE) {
      console.warn('Expired token data');
      return null;
    }

    const data = atob(encoded);
    const usage = JSON.parse(data);

    // Validate decrypted object and checksum
    if (!isValidUsage(usage)) {
      console.warn('Invalid usage data structure');
      return null;
    }

    const expectedChecksum = generateChecksum(usage);
    if (checksum !== expectedChecksum) {
      console.warn('Invalid checksum detected');
      return null;
    }

    // Verify integrity hash
    const expectedIntegrityHash = generateIntegrityHash(usage, getIntegritySalt());
    if (integrityHash !== expectedIntegrityHash) {
      console.warn('Invalid integrity hash detected');
      return null;
    }

    return usage;
  } catch (error) {
    console.error('Error decrypting usage:', error);
    return null;
  }
};

const generateSignature = (data: string, timestamp: string): string => {
  const input = `${data}${timestamp}${ENCRYPTION_KEY}`;
  return hashCode(input).toString(36);
};

const generateChecksum = (usage: TokenUsage): string => {
  const input = `${usage.used}:${usage.limit}:${usage.lastReset}:${ENCRYPTION_KEY}`;
  return hashCode(input).toString(36);
};

const generateIntegrityHash = (usage: TokenUsage, salt: string): string => {
  const input = `${usage.used}:${usage.limit}:${usage.lastReset}:${salt}:${ENCRYPTION_KEY}`;
  return hashCode(input).toString(36);
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const isValidUsage = (usage: any): usage is TokenUsage => {
  return (
    usage &&
    typeof usage === 'object' &&
    typeof usage.used === 'number' &&
    typeof usage.limit === 'number' &&
    typeof usage.lastReset === 'string' &&
    usage.used >= 0 &&
    usage.limit > 0 &&
    !isNaN(new Date(usage.lastReset).getTime()) &&
    usage.used <= usage.limit
  );
};