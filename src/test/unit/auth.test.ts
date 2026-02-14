import { describe, it, expect, vi } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../../lib/auth';

describe('Authentication Utilities', () => {

    describe('Password Hashing', () => {
        it('should hash a password and be different from plain text', async () => {
            const password = 'mySecurePassword123';
            const hashed = await hashPassword(password);
            expect(hashed).not.toBe(password);
            expect(hashed.length).toBeGreaterThan(20);
        });

        it('should return true for correct password comparison', async () => {
            const password = 'mySecurePassword123';
            const hashed = await hashPassword(password);
            const isMatch = await comparePassword(password, hashed);
            expect(isMatch).toBe(true);
        });

        it('should return false for incorrect password comparison', async () => {
            const password = 'mySecurePassword123';
            const hashed = await hashPassword(password);
            const isMatch = await comparePassword('wrongPassword', hashed);
            expect(isMatch).toBe(false);
        });
    });

    describe('JWT Tokens', () => {
        const payload = { userId: '123', role: 'ADMIN' };

        it('should sign a token and return a string', () => {
            const token = signToken(payload);
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(10);
        });

        it('should verify a valid token and return the payload', () => {
            const token = signToken(payload);
            const decoded = verifyToken(token) as any;
            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });

        it('should return null for an invalid token', () => {
            const result = verifyToken('invalid-token-string');
            expect(result).toBeNull();
        });
    });
});
