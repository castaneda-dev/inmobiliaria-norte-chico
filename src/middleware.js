import { NextResponse } from 'next/server';

export function middleware(req) {
  // Check if the route is an admin route
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/dashboard_admin')) {
    // Look for the Supabase auth token stored in cookies
    const token = req.cookies.get('sb-access-token')?.value;

    // If no token exists, redirect to the homepage
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard_admin/:path*'],
};
