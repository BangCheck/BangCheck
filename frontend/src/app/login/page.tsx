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
    <div className="flex-1 container-center bg-white min-h-[600px]">
      {/* Login Card (99:103) */}
      <div className="w-[400px] h-[484px] border border-border-light rounded-[6px] flex flex-col items-center justify-center px-8 bg-white">
        <div className="flex flex-col items-center gap-[24px]">
          <div className="flex flex-col items-center gap-[38px]">
            {/* Logo & Welcome (99:106) */}
            <div className="flex flex-col items-center gap-[18px]">
              <LogoWithText size={34} textClassName="text-[27px]" />
              <div className="text-center">
                <h1 className="text-[#232527] text-[24px] font-semibold leading-tight whitespace-nowrap">
                  방체크에 오신 걸 환영해요.
                </h1>
                <p className="text-[#232527] text-[24px] font-light leading-tight whitespace-nowrap">
                  소셜 계정으로 간편하게 시작하세요
                </p>
              </div>
            </div>

            {/* Social Buttons (99:122) */}
            <div className="flex flex-col gap-[10px]">
              <button 
                onClick={() => handleLogin('naver')} 
                disabled={!!isLoading}
                className={cn(
                  "flex items-center justify-center gap-[6px] w-[320px] py-[12px] bg-[#f5f5f5] rounded-[16px] transition-all cursor-pointer hover:bg-gray-200 active:scale-[0.98]",
                  isLoading === 'naver' && "opacity-50 cursor-wait"
                )}
                aria-label="네이버로 시작하기"
              >
                <div className="w-[20px] h-[20px] relative overflow-hidden shrink-0">
                  <Image 
                    src="/images/naver-logo.png" 
                    alt="" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[#232527] text-[12px] font-medium leading-tight">
                  {isLoading === 'naver' ? '연결 중...' : '네이버로 시작하기'}
                </span>
              </button>
              
              <button 
                onClick={() => handleLogin('google')} 
                disabled={!!isLoading}
                className={cn(
                  "flex items-center justify-center gap-[6px] w-[320px] py-[12px] bg-[#f5f5f5] rounded-[16px] transition-all cursor-pointer hover:bg-gray-200 active:scale-[0.98]",
                  isLoading === 'google' && "opacity-50 cursor-wait"
                )}
                aria-label="Google로 시작하기"
              >
                <div className="w-[20px] h-[20px] relative shrink-0">
                  <Image 
                    src="/images/google-logo.png" 
                    alt="" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[#232527] text-[12px] font-medium leading-tight">
                  {isLoading === 'google' ? '연결 중...' : 'Google로 시작하기'}
                </span>
              </button>
            </div>
          </div>

          {/* Legal Notice (99:132) */}
          <p className="text-[#a0a0a0] text-[12px] text-center leading-tight whitespace-nowrap">
            시작하기를 누르면{' '}
            <Link href="/terms" className="text-[#232527] font-regular">이용약관</Link>
            {' '}및{' '}
            <Link href="/privacy" className="text-[#232527] font-regular">개인정보 처리방침</Link>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
