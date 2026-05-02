"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogoWithText } from "@/components/Logo";
import { getOAuthUrl } from "./actions";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (provider: "naver" | "google") => {
    setIsLoading(provider);
    try {
      await getOAuthUrl(provider);
    } catch (error) {
      console.error(error);
      setIsLoading(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white min-h-[calc(100vh-64px-80px)] md:min-h-[calc(100vh-64px)] px-5">
      {/* Login Container */}
      <div className="w-full max-w-[400px] md:border md:border-border-light md:rounded-[6px] flex flex-col items-center justify-center py-10 md:h-[484px] md:px-8 bg-white">
        <div className="flex flex-col items-center w-full gap-[32px] md:gap-[24px]">
          <div className="flex flex-col items-center w-full gap-[40px] md:gap-[38px]">
            {/* Logo & Welcome */}
            <div className="flex flex-col items-center gap-[20px] md:gap-[18px]">
              <LogoWithText size={38} textClassName="text-[30px]" />
              <div className="text-center space-y-1">
                <h1 className="text-[#232527] text-[22px] md:text-[24px] font-bold leading-tight">
                  방체크에 오신 걸 환영해요.
                </h1>
                <p className="text-[#232527] text-[18px] md:text-[24px] font-medium opacity-70 leading-tight">
                  소셜 계정으로 간편하게 시작하세요
                </p>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="flex flex-col gap-[12px] w-full">
              <button
                onClick={() => handleLogin("naver")}
                disabled={!!isLoading}
                className={cn(
                  "flex items-center justify-center gap-[10px] w-full py-[14px] md:py-[12px] bg-[#03A94D] rounded-[8px] md:rounded-[6px] transition-all cursor-pointer hover:brightness-95 active:scale-[0.98]",
                  isLoading === "naver" && "opacity-50 cursor-wait",
                )}
                aria-label="네이버 로그인"
              >
                <div className="w-[13px] h-[13px] relative overflow-hidden shrink-0">
                  <Image
                    src="/images/logo_N.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white text-[15px] md:text-[12px] font-bold leading-tight">
                  {isLoading === "naver" ? "연결 중..." : "네이버 로그인"}
                </span>
              </button>

              <button
                onClick={() => handleLogin("google")}
                disabled={!!isLoading}
                className={cn(
                  "flex items-center justify-center gap-[10px] w-full py-[14px] md:py-[12px] bg-white border border-[#E2E2E2] rounded-[8px] md:rounded-[6px] transition-all cursor-pointer hover:bg-gray-50 active:scale-[0.98]",
                  isLoading === "google" && "opacity-50 cursor-wait",
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
                <span className="text-[#232527] text-[15px] md:text-[12px] font-bold leading-tight">
                  {isLoading === "google" ? "연결 중..." : "Google로 시작하기"}
                </span>
              </button>
            </div>
          </div>

          {/* Legal Notice */}
          <p className="text-[#a0a0a0] text-[12px] md:text-[12px] text-center leading-relaxed max-w-[280px] md:max-w-none">
            시작하기를 누르면{" "}
            <Link href="/terms" className="text-[#0A607D] font-bold underline">
              이용약관
            </Link>{" "}
            및{" "}
            <Link
              href="/privacy"
              className="text-[#0A607D] font-bold underline"
            >
              개인정보 처리방침
            </Link>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
