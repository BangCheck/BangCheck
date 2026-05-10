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

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/api/v1/users/me');
  return response.data.data;
};
