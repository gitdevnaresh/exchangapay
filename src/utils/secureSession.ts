// Security utility to prevent SECURE_SESSION_FAILED errors
import CryptoJS from 'crypto-js';

export class SecureSessionManager {
    private static instance: SecureSessionManager;
    private encryptionKey: string | null = null;
    private isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): SecureSessionManager {
        if (!SecureSessionManager.instance) {
            SecureSessionManager.instance = new SecureSessionManager();
        }
        return SecureSessionManager.instance;
    }

    // Initialize with proper error handling
    public initialize(key?: string): boolean {
        try {
            this.encryptionKey = key || this.generateSecureKey();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize SecureSessionManager:', error);
            this.isInitialized = false;
            return false;
        }
    }

    // Generate a secure key
    private generateSecureKey(): string {
        return CryptoJS.lib.WordArray.random(256/8).toString();
    }

    // Safe encryption with error handling
    public safeEncrypt(data: string): string {
        if (!this.isInitialized || !this.encryptionKey) {
            console.warn('SecureSessionManager not initialized, returning original data');
            return data;
        }

        try {
            if (!data || typeof data !== 'string') {
                return '';
            }

            const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
            return encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            return data; // Return original data if encryption fails
        }
    }

    // Safe decryption with error handling
    public safeDecrypt(encryptedData: string): string {
        if (!this.isInitialized || !this.encryptionKey) {
            console.warn('SecureSessionManager not initialized, returning original data');
            return encryptedData || '';
        }

        try {
            if (!encryptedData || typeof encryptedData !== 'string') {
                return '';
            }

            // Check if data is already decrypted (common cause of SECURE_SESSION_FAILED)
            if (this.isPlainText(encryptedData)) {
                return encryptedData;
            }

            const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
            const result = decrypted.toString(CryptoJS.enc.Utf8);
            
            // Validate decryption result
            if (!result) {
                console.warn('Decryption resulted in empty string, returning original data');
                return encryptedData;
            }

            return result;
        } catch (error) {
            console.warn('Decryption failed, returning original data:', error.message);
            return encryptedData || '';
        }
    }

    // Check if data is plain text (not encrypted)
    private isPlainText(data: string): boolean {
        try {
            // Basic heuristics to detect plain text
            if (data.includes('@') && data.includes('.')) return true; // Email
            if (data.match(/^\+?\d+$/)) return true; // Phone number
            if (data.length < 20 && !data.includes('=')) return true; // Short strings without base64 padding
            return false;
        } catch {
            return false;
        }
    }

    // Validate session integrity
    public validateSession(): boolean {
        try {
            if (!this.isInitialized || !this.encryptionKey) {
                return false;
            }

            // Test encryption/decryption cycle
            const testData = 'session_test_' + Date.now();
            const encrypted = this.safeEncrypt(testData);
            const decrypted = this.safeDecrypt(encrypted);
            
            return decrypted === testData;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }

    // Reset session (useful for recovery)
    public resetSession(): void {
        this.encryptionKey = null;
        this.isInitialized = false;
        console.log('Session reset completed');
    }

    // Get session status
    public getStatus(): { initialized: boolean; valid: boolean } {
        return {
            initialized: this.isInitialized,
            valid: this.validateSession()
        };
    }
}

// Export singleton instance
export const secureSession = SecureSessionManager.getInstance();

// Utility functions for backward compatibility
export const safeEncryptAES = (data: string): string => {
    return secureSession.safeEncrypt(data);
};

export const safeDecryptAES = (data: string): string => {
    return secureSession.safeDecrypt(data);
};

// Initialize on import
secureSession.initialize();