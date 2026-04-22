'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { LogoWithText } from '@/components/Logo';
import { getOAuthUrl } from './actions';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (provider: 'naver' | 'google') => {
    setIsLoading(provider);
    try {
      await getOAuthUrl(provider);
    } catch (error) {
      console.error(error);
      setIsLoading(null);
    }
  };

  return (
    <div className="flex-1 container-center p-4 bg-white overflow-x-hidden">
      <div className="login-card w-full max-w-[400px]">
        {/* Logo & Welcome */}
        <div className="flex flex-col items-center gap-6 mb-10 w-full">
          <LogoWithText size={40} textClassName="text-[24px] md:text-[27px]" />
          <div className="text-center w-full px-2">
            <h1 className="text-text-main text-xl md:text-2xl font-semibold leading-tight mb-2 break-keep">
              방체크에 오신 걸 환영해요.
            </h1>
            <p className="text-text-main text-lg md:text-xl font-light leading-tight break-keep">
              소셜 계정으로 간편하게 시작하세요
            </p>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-2.5 w-full mb-6 px-2">
          <button 
            onClick={() => handleLogin('naver')} 
            disabled={!!isLoading}
            className={cn("social-button w-full", isLoading === 'naver' && "opacity-50 cursor-wait")}
            aria-label="네이버 계정으로 로그인하기"
          >
            <div className="w-5 h-5 relative overflow-hidden shrink-0">
               <Image 
                  src="/images/naver-logo.png" 
                  alt="" 
                  width={20} 
                  height={20}
                  className="object-contain"
               />
            </div>
            <span className="truncate">{isLoading === 'naver' ? '연결 중...' : '네이버로 시작하기'}</span>
          </button>
          <button 
            onClick={() => handleLogin('google')} 
            disabled={!!isLoading}
            className={cn("social-button w-full", isLoading === 'google' && "opacity-50 cursor-wait")}
            aria-label="구글 계정으로 로그인하기"
          >
            <div className="w-5 h-5 relative shrink-0">
               <Image 
                  src="/images/google-logo.png" 
                  alt="" 
                  width={20} 
                  height={20}
                  className="object-contain"
               />
            </div>
            <span className="truncate">{isLoading === 'google' ? '연결 중...' : 'Google로 시작하기'}</span>
          </button>
        </div>

        {/* Legal Notice */}
        <p className="text-text-caption text-[11px] md:text-[12px] text-center leading-relaxed px-4 break-keep">
          시작하기를 누르면{' '}
          <Link href="/terms" className="text-text-main font-medium underline underline-offset-2">이용약관</Link>
          {' '}및{' '}
          <Link href="/privacy" className="text-text-main font-medium underline underline-offset-2">개인정보 처리방침</Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
