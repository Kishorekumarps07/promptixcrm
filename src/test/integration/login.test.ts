import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as dbHandler from '../db-handler';
import { POST } from '../../app/api/auth/login/route';
import User from '../../models/User';
import { hashPassword } from '../../lib/auth';

describe('Login API Integration', () => {
    beforeAll(async () => await dbHandler.connect());
    afterAll(async () => await dbHandler.closeDatabase());
    beforeEach(async () => await dbHandler.clearDatabase());

    it('should login successfully with correct credentials', async () => {
        const password = 'password123';
        const hashedPassword = await hashPassword(password);

        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'Active'
        });

        const req = new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: password
            })
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Login successful');
        expect(data.user.email).toBe('test@example.com');

        const cookie = response.headers.get('set-cookie');
        expect(cookie).toContain('token=');
    });

    it('should fail with incorrect password', async () => {
        const password = 'password123';
        const hashedPassword = await hashPassword(password);

        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'Active'
        });

        const req = new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Invalid credentials');
    });
});
