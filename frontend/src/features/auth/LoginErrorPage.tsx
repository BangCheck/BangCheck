import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

export default function LoginErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-6">
      <p className="text-text-main text-[20px] font-semibold text-center">
        로그인에 실패했어요
      </p>
      <p className="text-text-caption text-[14px] text-center leading-[1.6]">
        일시적인 오류가 발생했습니다.<br />다시 시도해주세요.
      </p>
      <Link
        to={ROUTES.LOGIN}
        className="bg-brand-primary text-white text-[14px] font-semibold px-6 py-3 rounded-[6px] hover:bg-brand-primary-dark transition-colors"
      >
        로그인 페이지로 돌아가기
      </Link>
    </div>
  );
}
