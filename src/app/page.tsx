import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { readFile } from 'fs/promises';
import { join } from 'path';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-this-in-vercel'
);

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/api/auth/google');
  }

  try {
    const verified = await jwtVerify(token, secret);
    const email = verified.payload.email as string;

    if (!email.endsWith('@4patriots.com')) {
      redirect('/api/auth/google');
    }

    // Serve the menu page
    const filePath = join(process.cwd(), 'public', 'index.html');
    const content = await readFile(filePath, 'utf-8');

    return (
      <html>
        <body dangerouslySetInnerHTML={{ __html: content }} />
      </html>
    );
  } catch (error) {
    console.error('Token verification failed:', error);
    redirect('/api/auth/google');
  }
}