import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode((process.env.JWT_SECRET || 'fallback-secret').trim());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://promptix.pro',
    'https://www.promptix.pro'
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // CORS Handling
    const origin = req.headers.get('origin');
    const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || origin.endsWith('.promptix.pro'));
    const isPreflight = req.method === 'OPTIONS';

    // Handle CORS Preflight
    if (isPreflight) {
        const headers = {
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400', // 24 hours
        };

        if (isAllowedOrigin) {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    ...headers,
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                },
            });
        }

        // If not allowed origin in preflight, just continue or 200 without CORS headers (strict)
        return new NextResponse(null, { status: 200, headers });
    }

    // Normal Request Processing
    const res = NextResponse.next();

    // Add CORS headers to normal responses
    if (isAllowedOrigin) {
        res.headers.set('Access-Control-Allow-Origin', origin);
        res.headers.set('Access-Control-Allow-Credentials', 'true');
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    const token = req.cookies.get('token')?.value;

    // Protect routes (UI and API)
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    const isEmployeeRoute = pathname.startsWith('/employee') || pathname.startsWith('/api/employee');

    if (isAdminRoute || isEmployeeRoute) {
        if (!token) {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const { payload } = await jwtVerify(token, SECRET);
            const role = payload.role as string;

            // Define high-privilege roles that can access admin routes
            const adminRoles = ['ADMIN', 'MANAGER', 'HR', 'IT'];
            
            if (isAdminRoute && !adminRoles.includes(role)) {
                if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                return NextResponse.redirect(new URL('/', req.url));
            }
            
            // Any authenticated user should ideally be able to see "employee" level dashboards if they are part of the system
            // but we can restrict it if needed. For now, let's just ensure they have A role.
            if (isEmployeeRoute && !role) {
                if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
                return NextResponse.redirect(new URL('/', req.url));
            }

        } catch (e) {
            if (pathname.startsWith('/api')) return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: [
        '/admin/:path*', '/employee/:path*',
        '/api/admin/:path*', '/api/employee/:path*'
    ],
};
