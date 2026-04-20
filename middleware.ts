import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-this-in-vercel'
);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow auth routes without session check
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get('session')?.value;

  if (!token) {
    // No session, redirect to login
    return NextResponse.redirect(new URL('/api/auth/google', request.url));
  }

  try {
    // Verify and decode the JWT
    const verified = await jwtVerify(token, secret);
    const email = verified.payload.email as string;
    const exp = verified.payload.exp as number;

    // Check expiration
    if (Date.now() >= exp * 1000) {
      // Token expired
      const response = NextResponse.redirect(new URL('/api/auth/google', request.url));
      response.cookies.delete('session');
      return response;
    }

    // Check email domain
    if (!email.endsWith('@4patriots.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  } catch (err) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/api/auth/google', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
