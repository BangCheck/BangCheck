import { cn } from '@/lib/utils';

type Quote = { text: string[]; featured: boolean };

const ROWS: Quote[][] = [
  [
    { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], featured: true },
    { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], featured: false },
    { text: ['옵션 잘 작동되는지 하나하나', '확인 못 한 것이 후회돼요'], featured: false },
    { text: ['채광을 중요하게 생각 안하고', '계약했다가 고생한 경험이 있어요.'], featured: true },
  ],
  [
    { text: ['아래 상가가 있는걸 간과하고', '이사했다가 바퀴벌레와 전쟁을 했습니다'], featured: false },
    { text: ['채광을 중요하게 생각 안하고 계약했다가', '고생한 경험이 있어요.'], featured: true },
    { text: ['깊은 고민으로 인해', '매물을 놓쳤어요.'], featured: false },
    { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], featured: true },
  ],
  [
    { text: ['수압 확인 안 했다가 샤워할 때마다', '물이 너무 약해서 불편해요.'], featured: true },
    { text: ['벽이 얇은 걸 확인 못 해서', '옆집 소음 때문에 매일 스트레스받아요.'], featured: false },
    { text: ['콘센트 위치를 안 보고 계약해서', '가전제품 배치가 너무 애매해졌어요.'], featured: true },
    { text: ['콘센트 위치를 안 보고 계약해서', '가전제품 배치가 너무 애매해졌어요.'], featured: false },
  ],
];

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <div
      className={cn(
        'flex-none flex flex-col gap-2 px-6 py-5 rounded-[8px] shadow-md',
        quote.featured
          ? 'bg-[#191b1e] text-white'
          : 'bg-[#eaeaea] text-[#777] opacity-36'
      )}
    >
      {/* 말풍선 삼각형 */}
      <div
        className={cn(
          'w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent',
          quote.featured ? 'border-b-white/20' : 'border-b-[#777]/20'
        )}
      />
      <p className="font-bold text-[18px] leading-[1.5] tracking-[-0.264px] whitespace-nowrap">
        {quote.text[0]}
        <br />
        {quote.text[1]}
      </p>
    </div>
  );
}

function QuoteRow({ quotes, offset }: { quotes: Quote[]; offset: string }) {
  return (
    <div className={cn('absolute flex gap-6 items-start', offset)}>
      {quotes.map((q, i) => (
        <QuoteCard key={i} quote={q} />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-[#191b1e] px-10 md:px-[190px] py-[100px] md:py-[140px] flex flex-col gap-[100px] items-start">
      {/* 헤딩 + 본문 */}
      <div className="flex flex-col gap-[60px] items-start text-white tracking-[-0.5px] max-w-[837px]">
        <h2 className="font-bold text-[32px] md:text-[40px] leading-[1.22]">
          서대문구 자취생을 위한 필수 체크리스트
        </h2>
        <p className="font-light text-[18px] md:text-[20px] leading-[1.3]">
          자취방 계약 후 후회하는 건, 결국 그때 못 본 작은 것들 때문입니다.
          <br />
          이 체크리스트는 먼저 살아본 자취생들의 후회 경험과
          <br />
          서대문구의 동네 특성을 담아, 놓치면 안 될 것만 모았습니다.
        </p>
      </div>

      {/* 카드 콜라주 + 설문 섹션 */}
      <div className="flex flex-col gap-[30px] items-start w-full max-w-[1060px]">
        {/* 카드 콜라주 컨테이너 */}
        <div className="bg-[#0a607d] w-full h-[515px] rounded-[8px] overflow-clip relative">
          <QuoteRow quotes={ROWS[0]} offset="top-5 left-0" />
          <QuoteRow quotes={ROWS[1]} offset="top-[206px] left-0" />
          <QuoteRow quotes={ROWS[2]} offset="top-[392px] left-0" />

          {/* 하단 페이드 그라데이션 */}
          <div className="absolute bottom-0 left-0 right-0 h-[289px] bg-gradient-to-t from-[#191b1e] to-transparent" />
        </div>

        {/* 설문 결과 설명 */}
        <div className="flex flex-col gap-9 items-start max-w-[837px]">
          <h3 className="font-bold text-[24px] md:text-[30px] text-white tracking-[-0.5px] leading-[1.22]">
            설문을 통해 기준을 세웠습니다.
          </h3>
          <p className="font-light text-[18px] md:text-[20px] text-white tracking-[-0.5px] leading-[1.3]">
            설문조사를 통해 자취방을 구할 때 후회했던 경험을 수집하고,
            <br />
            실제 선택에 도움이 되는 기준으로 정리했습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
