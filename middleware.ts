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

  // Allow public routes
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/about' ||
    request.nextUrl.pathname === '/privacy' ||
    request.nextUrl.pathname === '/terms' ||
    request.nextUrl.pathname === '/refund' ||
    request.nextUrl.pathname === '/pricing' ||
    request.nextUrl.pathname === '/shipping' ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Check authentication for other routes
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/transcribe/:path*',
    '/api/claudeai/:path*',
    '/api/paymentverify/:path*',
    '/api/razorpay/:path*',
    '/dashboard/:path*'
  ],
};