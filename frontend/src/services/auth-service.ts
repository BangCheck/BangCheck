import { api } from '@/lib/api';
import type { ApiResponse, User, OAuthProvider } from '@/types';

interface ExchangeResult {
  accessToken: string;
  user: User;
}

export const exchangeOAuthCode = async (
  provider: OAuthProvider,
  code: string,
  state: string
): Promise<ExchangeResult> => {
  const response = await api.get<ApiResponse<{ user: User }>>(
    `/api/v1/auth/oauth2/${provider}/callback`,
    { params: { code, state } }
  );
  const accessToken = response.headers['authorization']?.replace('Bearer ', '');
  if (!accessToken) throw new Error('Authorization header missing');
  return { accessToken, user: response.data.data.user };
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/api/v1/users/me');
  return response.data.data;
};
