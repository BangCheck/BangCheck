import { cn } from '@/lib/utils';
import Image from 'next/image';

type Quote = { text: [string, string]; dark: boolean };

const ROW1: Quote[] = [
  { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], dark: true },
  { text: ['옵션 잘 작동되는지 하나하나', '확인 못 한 것이 후회돼요'], dark: false },
  { text: ['채광을 중요하게 생각 안하고', '계약했다가 고생한 경험이 있어요.'], dark: true },
  { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], dark: false },
];

const ROW2: Quote[] = [
  { text: ['아래 상가가 있는걸 간과하고', '이사했다가 바퀴벌레와 전쟁을 했습니다'], dark: false },
  { text: ['채광을 중요하게 생각 안하고 계약했다가', '고생한 경험이 있어요.'], dark: true },
  { text: ['깊은 고민으로 인해', '매물을 놓쳤어요.'], dark: false },
  { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], dark: true },
];

const ROW3: Quote[] = [
  { text: ['수압 확인 안 했다가 샤워할 때마다', '물이 너무 약해서 불편해요.'], dark: true },
  { text: ['벽이 얇은 걸 확인 못 해서', '옆집 소음 때문에 매일 스트레스받아요.'], dark: false },
  { text: ['콘센트 위치를 안 보고 계약해서', '가전제품 배치가 너무 애매해졌어요.'], dark: true },
  { text: ['콘센트 위치를 안 보고 계약해서', '가전제품 배치가 너무 애매해졌어요.'], dark: false },
];

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <div
      className={cn(
        'flex-none relative flex flex-col justify-end gap-[10px] px-[30px] py-[20px] rounded-[8px] min-w-[320px]',
        quote.dark
          ? 'bg-[#191b1e] text-white drop-shadow-[0px_0px_15px_rgba(0,0,0,0.25)]'
          : 'bg-[#eaeaea] text-[#777] opacity-[0.36] drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)]'
      )}
    >
      {/* 말풍선 polygon 장식 */}
      <div className="absolute top-[93px] left-[30px] w-[78.808px] h-[68.25px] rotate-180">
        <Image
          src={quote.dark ? '/images/landing/polygon-dark.svg' : '/images/landing/polygon-light.svg'}
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <p className="font-bold text-[24px] leading-[1.5] tracking-[-0.264px] whitespace-nowrap relative z-10">
        {quote.text[0]}
        <br />
        {quote.text[1]}
      </p>
    </div>
  );
}

function QuoteRow({ quotes, offsetClass }: { quotes: Quote[]; offsetClass: string }) {
  return (
    <div className={cn('absolute flex gap-[24px] items-center', offsetClass)}>
      {quotes.map((q, i) => (
        <QuoteCard key={i} quote={q} />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-[#191b1e] w-full px-10 md:px-[190px] py-[100px] md:py-[140px] flex flex-col gap-[100px] items-start">
      {/* 헤딩 + 설명 */}
      <div className="flex flex-col gap-[60px] items-start text-white tracking-[-0.5px] w-full max-w-[837px]">
        <h2 className="font-bold text-[32px] md:text-[40px] leading-[1.22] not-italic">
          서대문구 자취생을 위한 필수 체크리스트
        </h2>
        <p className="font-light text-[18px] md:text-[20px] leading-[1.3] not-italic">
          자취방 계약 후 후회하는 건, 결국 그때 못 본 작은 것들 때문입니다.
          <br />
          이 체크리스트는 먼저 살아본 자취생들의 후회 경험과
          <br />
          서대문구의 동네 특성을 담아, 놓치면 안 될 것만 모았습니다.
        </p>
      </div>

      {/* 카드 콜라주 + 설문 설명 */}
      <div className="flex flex-col gap-[30px] items-start w-full">
        {/* 카드 콜라주 컨테이너 */}
        <div className="bg-[#0a607d] w-full h-[515px] rounded-[8px] overflow-clip relative">
          <QuoteRow quotes={ROW1} offsetClass="top-[20px] left-[-301px]" />
          <QuoteRow quotes={ROW2} offsetClass="top-[206px] left-[-29px]" />
          <QuoteRow quotes={ROW3} offsetClass="top-[392px] left-[-39px]" />

          {/* 하단 페이드 그라데이션 */}
          <div className="absolute left-0 right-0 h-[289px] bg-gradient-to-b from-transparent to-[#191b1e] top-[226px]" />
        </div>

        {/* 설문 결과 설명 */}
        <div className="flex flex-col gap-9 items-start max-w-[837px]">
          <h3 className="font-bold text-[28px] md:text-[30px] text-white tracking-[-0.5px] leading-[1.22] not-italic">
            설문을 통해 기준을 세웠습니다.
          </h3>
          <p className="font-light text-[18px] md:text-[20px] text-white tracking-[-0.5px] leading-[1.3] not-italic">
            설문조사를 통해 자취방을 구할 때 후회했던 경험을 수집하고,
            <br />
            실제 선택에 도움이 되는 기준으로 정리했습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
