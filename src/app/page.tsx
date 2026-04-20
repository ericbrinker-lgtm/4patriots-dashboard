import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-this-in-vercel'
);

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    // No session, redirect to Google login
    redirect('/api/auth/google');
  }

  try {
    // Verify session token
    const verified = await jwtVerify(token, secret);
    const email = verified.payload.email as string;

    // Verify email domain
    if (!email.endsWith('@4patriots.com')) {
      redirect('/api/auth/google');
    }

    // Session is valid, show the dashboard
    return (
      <div>
        <p>Authenticated as: {email}</p>
        <iframe
          src="/dashboard"
          style={{ width: '100%', height: '100vh', border: 'none' }}
        />
      </div>
    );
  } catch (error) {
    // Invalid token, redirect to login
    console.error('Token verification failed:', error);
    redirect('/api/auth/google');
  }
}
