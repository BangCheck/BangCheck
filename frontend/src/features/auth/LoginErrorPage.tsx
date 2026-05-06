import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

export default function LoginErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-6">
      <p className="text-[#232527] text-[20px] font-semibold text-center">
        로그인에 실패했어요
      </p>
      <p className="text-[#A0A0A0] text-[14px] text-center leading-[1.6]">
        일시적인 오류가 발생했습니다.<br />다시 시도해주세요.
      </p>
      <Link
        to={ROUTES.LOGIN}
        className="bg-[#0A607D] text-white text-[14px] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#084e6d] transition-colors"
      >
        로그인 페이지로 돌아가기
      </Link>
    </div>
  );
}
