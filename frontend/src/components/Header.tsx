import Link from 'next/link';
import { LogoWithText } from './Logo';

/**
 * 공통 헤더 컴포넌트
 * 피그마 디자인(99:133) 기반: 로고 좌측, 메뉴 중앙 배치
 * 반응형 대응: 화면이 좁아지면 메뉴가 겹치지 않도록 조정
 */
export default function Header() {
  return (
    <header className="flex items-center h-16 px-4 md:px-10 border-b border-border-light bg-white w-full sticky top-0 z-50">
      {/* 좌측 로고 영역 */}
      <div className="flex-1 flex justify-start z-10">
        <Link href="/">
          <LogoWithText size={20} textClassName="text-base md:text-lg" />
        </Link>
      </div>

      {/* 중앙 메뉴 영역 - 데스크탑에서는 절대 중앙, 모바일에서는 유연하게 배치 */}
      <nav aria-label="데스크탑 주요 네비게이션" className="hidden sm:flex gap-4 md:gap-7 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
        <Link href="/" className="nav-link whitespace-nowrap p-2">방 목록</Link>
        <Link href="/settings" className="nav-link whitespace-nowrap p-2">설정</Link>
      </nav>

      {/* 모바일 메뉴 (화면이 아주 좁을 때) */}
      <nav aria-label="모바일 주요 네비게이션" className="flex sm:hidden gap-0.5 ml-2">
        <Link href="/" className="nav-link text-xs whitespace-nowrap px-3 py-2 min-h-[44px] flex items-center">방 목록</Link>
        <Link href="/settings" className="nav-link text-xs whitespace-nowrap px-3 py-2 min-h-[44px] flex items-center">설정</Link>
      </nav>

      {/* 우측 공간 확보 */}
      <div className="flex-1 hidden sm:block" />
    </header>
  );
}
