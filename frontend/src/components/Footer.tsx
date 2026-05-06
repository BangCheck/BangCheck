import { Link } from 'react-router-dom';
import { LogoWithText } from './Logo';

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row md:items-center md:justify-between px-6 md:px-10 py-10 md:py-7 bg-[#FAFAFA] border-t border-[#E2E2E2] w-full gap-10 md:gap-0">
      <div className="flex flex-col gap-2">
        <LogoWithText size={24} textClassName="text-xl md:text-base uppercase tracking-wider" />
        <p className="text-[#A0A0A0] text-[11px] md:text-[12px]">© 2026 방체크. All rights reserved.</p>
      </div>
      <nav aria-label="푸터 네비게이션" className="flex items-center gap-1 md:gap-2">
        <Link to="/terms" className="text-[#232527] text-[14px] md:text-[12px] font-bold">이용약관</Link>
        <span className="text-[#E2E2E2] mx-1 md:mx-0">|</span>
        <Link to="/privacy" className="text-[#232527] text-[14px] md:text-[12px] font-bold">개인정보 처리방침</Link>
      </nav>
    </footer>
  );
}
