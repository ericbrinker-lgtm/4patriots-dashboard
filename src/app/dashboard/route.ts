import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'dashboard.html');
    const content = await readFile(filePath, 'utf-8');

    return new Response(content, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error serving dashboard:', error);
    return new Response('Dashboard not found', { status: 404 });
  }
}
