import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 인증이 필요한 경로 목록
 */
const protectedRoutes = ['/report', '/settings'];

/**
 * 인증이 되어있을 때 접근하면 안되는 경로 (로그인/회원가입 등)
 */
const publicOnlyRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 현재는 클라이언트 상태(Zustand) 기반이므로 미들웨어에서 쿠키를 통해 토큰 확인이 권장됨.
  // 우선 구조만 잡고, 실제 토큰 존재 여부는 쿠키 'accessToken'으로 판단한다고 가정.
  const token = request.cookies.get('accessToken')?.value;

  // 1. 인증이 필요한 페이지에 토큰 없이 접근할 경우
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // 원래 가려던 페이지 정보를 쿼리 스트링으로 전달하여 로그인 후 되돌아오게 함
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
