import type { TokenUsage } from './types';
import { encryptUsage, decryptUsage } from './crypto';

const STORAGE_KEY = 'token-usage';
const BACKUP_KEY = 'token-usage-backup';
const INTEGRITY_CHECK_INTERVAL = 1000; // 1 second
const RESET_KEY = 'token-reset-timestamp';

let lastKnownUsage: TokenUsage | null = null;
let integrityCheckInterval: number;

const startIntegrityCheck = () => {
  if (typeof window === 'undefined') return;
  
  integrityCheckInterval = window.setInterval(() => {
    const currentUsage = loadTokenUsage();
    
    // If usage was tampered with, restore last known good state
    if (lastKnownUsage && currentUsage) {
      if (
        currentUsage.used < lastKnownUsage.used ||
        currentUsage.limit !== lastKnownUsage.limit ||
        new Date(currentUsage.lastReset).getTime() !== new Date(lastKnownUsage.lastReset).getTime()
      ) {
        console.warn('Token usage tampering detected, restoring valid state');
        saveTokenUsage(lastKnownUsage);
      }
    }
  }, INTEGRITY_CHECK_INTERVAL);
};

const stopIntegrityCheck = () => {
  if (typeof window === 'undefined') return;
  clearInterval(integrityCheckInterval);
};

const getLastResetTimestamp = (): string => {
  const stored = localStorage.getItem(RESET_KEY);
  if (!stored) {
    const now = new Date().toISOString();
    localStorage.setItem(RESET_KEY, now);
    return now;
  }
  return stored;
};

export const saveTokenUsage = (usage: TokenUsage): void => {
  try {
    // Ensure lastReset is preserved
    const updatedUsage = {
      ...usage,
      lastReset: usage.lastReset || getLastResetTimestamp()
    };
    
    const encrypted = encryptUsage(updatedUsage);
    
    // Save to both main and backup storage
    localStorage.setItem(STORAGE_KEY, encrypted);
    localStorage.setItem(BACKUP_KEY, encrypted);
    localStorage.setItem(RESET_KEY, updatedUsage.lastReset);
    
    // Update last known good state
    lastKnownUsage = { ...updatedUsage };
    
    // Start integrity check if not already running
    if (!integrityCheckInterval) {
      startIntegrityCheck();
    }
  } catch (error) {
    console.error('Error saving token usage:', error);
    throw error;
  }
};

export const loadTokenUsage = (): TokenUsage | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    const backupEncrypted = localStorage.getItem(BACKUP_KEY);
    const lastReset = getLastResetTimestamp();
    
    // Try main storage first
    if (encrypted) {
      const decrypted = decryptUsage(encrypted);
      if (decrypted) {
        // Ensure lastReset is consistent
        decrypted.lastReset = lastReset;
        
        // Verify backup is in sync
        if (encrypted !== backupEncrypted) {
          localStorage.setItem(BACKUP_KEY, encrypted);
        }
        lastKnownUsage = decrypted;
        return decrypted;
      }
    }
    
    // Try backup if main fails
    if (backupEncrypted) {
      const decrypted = decryptUsage(backupEncrypted);
      if (decrypted) {
        // Ensure lastReset is consistent
        decrypted.lastReset = lastReset;
        
        // Restore main storage from backup
        localStorage.setItem(STORAGE_KEY, backupEncrypted);
        lastKnownUsage = decrypted;
        return decrypted;
      }
    }
    
    // Both storages are invalid
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    lastKnownUsage = null;
    return null;
  } catch (error) {
    console.error('Error loading token usage:', error);
    return null;
  }
};

// Clean up on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopIntegrityCheck);
}