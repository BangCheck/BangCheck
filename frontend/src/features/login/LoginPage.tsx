import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import { LogoWithText } from '@/components/Logo';
import { useAuthStore } from '@/store/use-auth-store';
import { getOAuthAuthorizeUrl } from '@/services/auth-service';
import { ROUTES } from '@/lib/routes';
import type { OAuthProvider } from '@/types';

function useOAuthLogin() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    setError(null);
    try {
      const url = await getOAuthAuthorizeUrl(provider);
      window.location.href = url;
    } catch {
      setError('로그인에 실패하였습니다. 다시 시도해주세요.');
      setLoadingProvider(null);
    }
  };

  return { login, loadingProvider, error };
}

function NaverLoginButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-3 w-full h-[48px] bg-[#03C75A] rounded-[6px] hover:bg-[#02b350] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <img src="/images/logo_N.svg" alt="네이버" className="h-[20px] w-auto" />
      <span className="text-white text-[14px] font-semibold">
        {loading ? '로그인 중...' : '네이버 로그인'}
      </span>
    </button>
  );
}

function GoogleLoginButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-3 w-full h-[48px] border border-[#E7E7E7] rounded-[6px] bg-white hover:bg-[#F8F8F8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <img src="/images/google-logo.png" alt="구글" className="h-[20px] w-auto" />
      <span className="text-[#121212] text-[14px] font-semibold">
        {loading ? '로그인 중...' : 'Google로 시작하기'}
      </span>
    </button>
  );
}

function TermsText() {
  return (
    <p className="text-[#A0A0A0] text-[12px] text-center leading-[1.3]">
      시작하기를 누르면{' '}
      <Link to="/terms" className="text-[#0A607D]">이용약관</Link>
      {' '}및{' '}
      <Link to="/privacy" className="text-[#0A607D]">개인정보 처리방침</Link>
      에 동의하게 됩니다.
    </p>
  );
}

interface LoginCardProps {
  onNaver: () => void;
  onGoogle: () => void;
  loadingProvider: OAuthProvider | null;
  error: string | null;
  sizeClass: { logo: number; text: string; title: string; width: string };
}

function LoginCard({ onNaver, onGoogle, loadingProvider, error, sizeClass }: LoginCardProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-[38px]">
        <div className="flex flex-col items-center gap-[18px]">
          <LogoWithText size={sizeClass.logo} textClassName={sizeClass.text} />
          <div className="text-center">
            <p className={`text-[#232527] ${sizeClass.title} font-semibold leading-[1.3]`}>
              방체크에 오신 걸 환영해요.
            </p>
            <p className={`text-[#232527] ${sizeClass.title} font-light leading-[1.3]`}>
              소셜 계정으로 간편하게 시작하세요
            </p>
            <p className="text-[#A0A0A0] text-[12px] mt-1 leading-[1.3]">
              비로그인시 데이터가 저장되지 않습니다.
            </p>
          </div>
        </div>
        <div className={`flex flex-col gap-[10px] ${sizeClass.width}`}>
          {error && (
            <p className="text-red-500 text-[12px] text-center">{error}</p>
          )}
          <NaverLoginButton onClick={onNaver} loading={loadingProvider === 'naver'} />
          <GoogleLoginButton onClick={onGoogle} loading={loadingProvider === 'google'} />
        </div>
      </div>
      <TermsText />
    </div>
  );
}

export default function LoginPage() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const { login, loadingProvider, error } = useOAuthLogin();

  if (isLoggedIn) {
    navigate(ROUTES.HOME, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Desktop */}
      <main className="hidden md:flex flex-1 items-center justify-center">
        <div className="border border-[#E2E2E2] rounded-[6px] px-[32px] py-[48px]">
          <LoginCard
            onNaver={() => login('naver')}
            onGoogle={() => login('google')}
            loadingProvider={loadingProvider}
            error={error}
            sizeClass={{ logo: 32, text: 'text-[27px]', title: 'text-[24px]', width: 'w-[320px]' }}
          />
        </div>
      </main>

      {/* Mobile */}
      <main className="flex md:hidden flex-1 items-center justify-center px-[16px] pb-[80px]">
        <div className="flex flex-col items-center gap-6 w-full max-w-[343px]">
          <LoginCard
            onNaver={() => login('naver')}
            onGoogle={() => login('google')}
            loadingProvider={loadingProvider}
            error={error}
            sizeClass={{ logo: 27, text: 'text-[20px]', title: 'text-[20px]', width: 'w-full' }}
          />
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
}
