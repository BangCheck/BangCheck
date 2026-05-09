import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { exchangeOAuthCode } from '@/services/auth-service';
import { ROUTES } from '@/lib/routes';
import type { OAuthProvider } from '@/types';

export default function AuthCallbackPage() {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const error = searchParams.get('error');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (error)            { navigate(ROUTES.LOGIN,       { replace: true }); return; }
    if (!state || !code)  { navigate(ROUTES.LOGIN,       { replace: true }); return; }
    if (!provider)        { navigate(ROUTES.LOGIN_ERROR, { replace: true }); return; }

    exchangeOAuthCode(provider as OAuthProvider, code, state)
      .then(({ accessToken, user }) => {
        setAuth(accessToken, user);
        navigate(ROUTES.HOME, { replace: true });
      })
      .catch(() => {
        navigate(ROUTES.LOGIN_ERROR, { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-text-caption text-[14px]">로그인 처리 중...</p>
    </div>
  );
}
