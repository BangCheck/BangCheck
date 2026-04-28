import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, PROTECTED_ROUTES } from '@/lib/routes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('accessToken')?.value;

  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  /*
  // 2. 이미 로그인된 사용자가 로그인 페이지에 접근할 경우 홈으로 리다이렉트
  if (publicOnlyRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  */

  return NextResponse.next();
}

/**
 * 미들웨어가 실행될 경로 설정
 */
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 대해 미들웨어 실행
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 디렉토리 내 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
