'use server';

import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * OAuth 인가 URL을 받아와서 리다이렉트하는 서버 액션
 */
export async function getOAuthUrl(provider: 'naver' | 'google') {
  let redirectUrl: string | null = null;

  try {
    console.log(`[OAuth] Requesting URL for provider: ${provider}`);
    console.log(`[OAuth] API Target: ${API_BASE_URL}/api/v1/auth/oauth2/${provider}`);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/oauth2/${provider}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OAuth] API Response Error (${response.status}):`, errorText);
      throw new Error(`백엔드 API 응답 오류: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[OAuth] API Success:`, result);
    
    if (result.success && result.data?.authorizeUrl) {
      redirectUrl = result.data.authorizeUrl;
    } else {
      throw new Error(result.message || '인가 URL 데이터가 없습니다.');
    }
  } catch (error) {
    console.error(`[OAuth] ${provider} Redirect Error:`, error);
    // redirect는 catch 블록 밖에서 실행하는 것이 안전함 (Next.js 내부 구현상)
    redirectUrl = `/login?error=${provider}_failed&msg=${encodeURIComponent(error instanceof Error ? error.message : '알 수 없는 오류')}`;
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}
