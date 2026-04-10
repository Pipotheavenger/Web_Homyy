import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger /admin/dashboard y subrutas
  if (pathname.startsWith('/admin/dashboard')) {
    const adminAuth = request.cookies.get('admin_authenticated')?.value;
    if (adminAuth !== 'true') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Proteger /worker/* y /user/*
  if (pathname.startsWith('/worker/') || pathname.startsWith('/user/')) {
    const authCookie = request.cookies.get('hommy_auth')?.value;
    const userType = request.cookies.get('hommy_user_type')?.value;

    // Sin sesión → login
    if (authCookie !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Worker intentando acceder a rutas de usuario
    if (pathname.startsWith('/user/') && userType === 'worker') {
      return NextResponse.redirect(new URL('/worker/dashboard', request.url));
    }

    // Usuario intentando acceder a rutas de worker
    if (pathname.startsWith('/worker/') && userType === 'user') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/worker/:path*',
    '/user/:path*',
  ],
};
