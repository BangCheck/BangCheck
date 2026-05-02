import Link from 'next/link';
import { LogoWithText } from './Logo';

/**
 * 공통 푸터 컴포넌트 (서버 컴포넌트)
 */
export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row md:items-center md:justify-between px-6 md:px-10 py-10 md:py-7 bg-bg-footer border-t border-border-light w-full gap-10 md:gap-0">
      <div className="flex flex-col gap-2">
        <LogoWithText size={24} textClassName="text-xl md:text-base uppercase tracking-wider" />
        <p className="text-[#a0a0a0] text-[11px] md:text-[12px]">© 2026 방체크. All rights reserved.</p>
      </div>
      <nav aria-label="푸터 네비게이션" className="flex items-center gap-1 md:gap-2">
        <Link href="/terms" className="text-[#232527] text-[14px] md:text-[12px] font-bold">이용약관</Link>
        <span className="text-[#E2E2E2] mx-1 md:mx-0">|</span>
        <Link href="/privacy" className="text-[#232527] text-[14px] md:text-[12px] font-bold">개인정보 처리방침</Link>
      </nav>
    </footer>
  );
}
