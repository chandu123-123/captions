import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Protected API routes
  if (request.nextUrl.pathname.startsWith('/api/transcribe') || 
      request.nextUrl.pathname.startsWith('/api/claudeai')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/transcribe/:path*',
    '/api/claudeai/:path*',
  ],
};