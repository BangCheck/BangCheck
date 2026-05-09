import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { ChevronRight } from '@/components/ui/ChevronRight';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/landing/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/64" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-[25px] max-w-[661px] w-full px-6 text-center">
        <h1 className="text-[40px] md:text-[56px] font-bold text-white tracking-[-0.5px] leading-[1.3]">
          첫 자취방,<br />
          체크리스트 하나면 걱정 없어요
        </h1>

        <div className="flex flex-col gap-[34px] items-center w-full">
          <p className="text-[16px] md:text-[18px] text-white tracking-[-0.5px] leading-[1.3]">
            원룸, 투룸, 오피스텔 — 어떤 방이든 꼼꼼하게 체크하고
            학교·역까지 거리를 확인하세요.
          </p>

          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-[10px] bg-[#0a607d] text-white font-bold text-[16px] tracking-[-0.5px] px-[10px] py-[16px] rounded-[8px] w-[210px] justify-center hover:bg-[#084e6d] transition-colors"
          >
            체크리스트 시작하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
