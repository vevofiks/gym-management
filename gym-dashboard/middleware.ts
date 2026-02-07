import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login'];

// Define protected routes that require authentication
const protectedRoutes = ['/', '/members', '/finances', '/analytics', '/plans', '/settings'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Get the auth token from cookies or check localStorage via headers
    // Note: In Next.js middleware, we can't access localStorage directly
    // We'll rely on the client-side ProtectedRoute component for the main protection
    // This middleware serves as an additional layer
    
    const authCookie = request.cookies.get('auth-token');
    const isAuthenticated = !!authCookie?.value;
    
    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => {
        if (route === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(route);
    });
    
    // Redirect authenticated users away from login page
    if (isPublicRoute && isAuthenticated && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }
    
    // For protected routes, let the client-side ProtectedRoute handle it
    // This is because we're using localStorage for auth state
    // Middleware can't access localStorage, only cookies
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
    ],
};
