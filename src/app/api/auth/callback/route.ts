import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-this-in-vercel'
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Verify state to prevent CSRF attacks
  const savedState = request.cookies.get('oauth_state')?.value;
  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 });
    }

    const tokens = await tokenResponse.json();

    // Get user info using the access token
    const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 400 });
    }

    const user = await userResponse.json();
    const email = user.email;

    // Verify email domain is @4patriots.com
    if (!email.endsWith('@4patriots.com')) {
      return NextResponse.json(
        { error: 'Only 4patriots.com email addresses are allowed' },
        { status: 403 }
      );
    }

    // Create JWT session token (72 hours expiration)
    const expiresAt = Math.floor(Date.now() / 1000) + 72 * 60 * 60;
    const sessionToken = await new SignJWT({
      email,
      exp: expiresAt,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);

    // Create response redirecting to menu
    const response = NextResponse.redirect(new URL('/index.html', baseUrl));

    // Set secure session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 72 * 60 * 60, // 72 hours
    });

    // Clean up state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
