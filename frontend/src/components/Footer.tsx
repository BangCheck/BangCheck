import Link from 'next/link';
import { LogoWithText } from './Logo';

/**
 * 공통 푸터 컴포넌트 (서버 컴포넌트)
 */
export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-10 py-7 bg-bg-footer border-t border-border-light w-full">
      <div className="flex flex-col gap-1">
        <LogoWithText size={20} textClassName="text-base" />
        <p className="text-text-caption text-[12px]">© 2026 방체크. All rights reserved.</p>
      </div>
      <nav aria-label="푸터 네비게이션" className="flex items-center gap-2">
        <Link href="/terms" className="footer-link p-2">이용약관</Link>
        <span className="w-[1px] h-3 bg-border-light mx-1" />
        <Link href="/privacy" className="footer-link p-2">개인정보 처리방침</Link>
      </nav>
    </footer>
  );
}
