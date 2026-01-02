import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth'; // Careful: implementing verifying in edge middleware with jsonwebtoken might fail. 
// Standard jsonwebtoken often has issues in Edge runtime. 
// For simplicity in Phase 0, if this fails, we will move logic or switch to 'jose'.
// Let's use 'jose' for middleware as it's edge compatible, or just try basic decoding if not verifying deeply.
// Actually, I installed 'jose' in the plan but didn't use it in auth.ts. 
// Re-checking dependencies... I installed 'jose'. I should use it here for Edge compatibility.

import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // protect routes
    // Protect routes (UI and API)
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    const isEmployeeRoute = pathname.startsWith('/employee') || pathname.startsWith('/api/employee');
    const isStudentRoute = pathname.startsWith('/student') || pathname.startsWith('/api/student');

    if (isAdminRoute || isEmployeeRoute || isStudentRoute) {
        if (!token) {
            // API routes should ensure 401 instead of redirect?
            // For now, redirecting to login is fine for UI, but for API might be weird. 
            // Better to just strict check.
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const { payload } = await jwtVerify(token, SECRET);
            const role = payload.role as string;

            if (isAdminRoute && role !== 'ADMIN') {
                if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                return NextResponse.redirect(new URL('/', req.url));
            }
            if (isEmployeeRoute && role !== 'EMPLOYEE') {
                if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                return NextResponse.redirect(new URL('/', req.url));
            }
            if (isStudentRoute && role !== 'STUDENT') {
                if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                return NextResponse.redirect(new URL('/', req.url));
            }

            // Student Onboarding Check
            if (role === 'STUDENT') {
                const isOnboardingCompleted = payload.isOnboardingCompleted === true;
                const isOnboardingPage = pathname.startsWith('/student/onboarding');
                const isOnboardingApi = pathname.startsWith('/api/student/onboarding');

                // If NOT completed -> Force to Onboarding (Allow /api/student/onboarding for submission)
                if (!isOnboardingCompleted) {
                    if (!isOnboardingPage && !isOnboardingApi) {
                        // Allow basic static assets or necessary APIs if needed, but here we block main routes
                        if (pathname.startsWith('/api')) {
                            // Allow onboarding API, block others
                            if (!isOnboardingApi) return NextResponse.json({ message: 'Complete onboarding first' }, { status: 403 });
                        } else {
                            return NextResponse.redirect(new URL('/student/onboarding', req.url));
                        }
                    }
                }
                // If Completed -> Block access to Onboarding page (Redirect to Dashboard)
                else if (isOnboardingCompleted && isOnboardingPage) {
                    return NextResponse.redirect(new URL('/student/dashboard', req.url));
                }
            }

        } catch (e) {
            if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }



    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*', '/employee/:path*', '/student/:path*',
        '/api/admin/:path*', '/api/employee/:path*', '/api/student/:path*'
    ],
};
