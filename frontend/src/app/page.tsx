import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/services/get-query-client';
import AuthButtons from '@/components/AuthButtons';

/**
 * 서버 컴포넌트인 메인 페이지
 * 1. 클라이언트 자바스크립트 양을 줄여 초기 로딩(FCP)을 개선합니다.
 * 2. 필요 시 서버에서 데이터를 미리 페칭(Prefetching)할 수 있는 구조입니다.
 */
export default async function Home() {
  const queryClient = getQueryClient();

  // 예: 서버에서 방 목록을 미리 불러오고 싶을 때 (주석 해제 시 동작)
  /*
  await queryClient.prefetchQuery({
    queryKey: ['rooms'],
    queryFn: getRooms, // 실제 API 함수
  });
  */

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-main mb-4">SWYP 랜딩 페이지</h1>
        <p className="text-text-caption">디자인 시안 대기 중입니다.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light w-full max-w-md">
        {/* 클라이언트 사이드 인터랙션이 필요한 부분만 HydrationBoundary로 감싸 전달 */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <AuthButtons />
        </HydrationBoundary>
      </div>
    </main>
  );
}
