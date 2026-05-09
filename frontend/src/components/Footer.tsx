import { Link } from 'react-router-dom';
import { LogoWithText } from './Logo';

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-10 py-7 bg-bg-footer border-t border-border-light w-full gap-6 md:gap-0">
      <div className="flex flex-col gap-2">
        <LogoWithText size={20} textClassName="text-base uppercase tracking-wider" />
        <p className="text-text-caption text-[12px]">© 2026 방체크. All rights reserved.</p>
      </div>
      <nav aria-label="푸터 네비게이션" className="flex items-center gap-2">
        <Link to="/terms" className="text-text-main text-[12px] font-bold">이용약관</Link>
        <span className="text-border-light">|</span>
        <Link to="/privacy" className="text-text-main text-[12px] font-bold">개인정보 처리방침</Link>
      </nav>
    </footer>
  );
}
