import { api } from '@/lib/api';
import type { ApiResponse, User, OAuthProvider } from '@/types';

export const getOAuthAuthorizeUrl = async (provider: OAuthProvider): Promise<string> => {
  const response = await api.get<ApiResponse<{ authorizeUrl: string }>>(`/api/v1/auth/oauth2/${provider}`);
  return response.data.data.authorizeUrl;
};

interface ExchangeResult {
  accessToken: string;
  user: User;
}

interface OAuthCallbackData {
  resultType: 'LOGIN' | 'REGISTERED' | 'REACTIVATED';
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
}

export const exchangeOAuthCode = async (
  provider: OAuthProvider,
  code: string,
  state: string
): Promise<ExchangeResult> => {
  const response = await api.get<ApiResponse<OAuthCallbackData>>(
    `/api/v1/auth/oauth2/${provider}/callback`,
    { params: { code, state } }
  );
  const accessToken = response.headers['authorization']?.replace('Bearer ', '');
  if (!accessToken) throw new Error('Authorization header missing');
  const { id, email, nickname, profileImageUrl } = response.data.data;
  const user: User = { id, email, nickname, profileImageUrl: profileImageUrl ?? undefined };
  return { accessToken, user };
};

// BC-AUTH-02: 서버 세션(refresh_tokens 행 + HttpOnly 쿠키)을 종료한다.
// 실패해도 호출부는 로컬 store 정리를 계속 진행해야 한다 — 여기서는 요청만 보낸다.
export const logoutServer = async (): Promise<void> => {
  await api.post<ApiResponse<void>>('/api/v1/auth/logout');
};
