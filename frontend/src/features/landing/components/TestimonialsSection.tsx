import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SectionWrapper } from './SectionWrapper';

type Quote = { text: [string, string]; dark: boolean };

const ROWS: Quote[][] = [
  [
    { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], dark: true },
    { text: ['옵션 잘 작동되는지 하나하나', '확인 못 한 것이 후회돼요'], dark: false },
    { text: ['채광을 중요하게 생각 안하고', '계약했다가 고생한 경험이 있어요.'], dark: true },
    { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], dark: false },
  ],
  [
    { text: ['아래 상가가 있는걸 간과하고', '이사했다가 바퀴벌레와 전쟁을 했습니다'], dark: false },
    { text: ['채광을 중요하게 생각 안하고 계약했다가', '고생한 경험이 있어요.'], dark: true },
    { text: ['깊은 고민으로 인해', '매물을 놓쳤어요.'], dark: false },
    { text: ['방에 에어컨이 없어서', '여름에 침대없는 거실에서 잤어요'], dark: true },
  ],
  [
    { text: ['수압 확인 안 했다가 샤워할 때마다', '물이 너무 약해서 불편해요.'], dark: true },
    { text: ['벽이 얇은 걸 확인 못 해서', '옆집 소음 때문에 매일 스트레스받아요.'], dark: false },
    { text: ['콘센트 위치를 안 보고 계약해서', '가전제품 배치가 너무 애매해졌어요.'], dark: true },
    { text: ['콘센트 위치를 안 보고 계약해서', '가전제품 배치가 너무 애매해졌어요.'], dark: false },
  ],
];

const ROW_OFFSETS = ['top-[20px] left-[-301px]', 'top-[206px] left-[-29px]', 'top-[392px] left-[-39px]'];

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
      <div className="absolute top-[93px] left-[30px] w-[78.808px] h-[68.25px] rotate-180">
        <Image
          src={quote.dark ? '/images/landing/polygon-dark.svg' : '/images/landing/polygon-light.svg'}
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <p className="font-bold text-[24px] leading-[1.5] tracking-[-0.264px] whitespace-nowrap relative z-10">
        {quote.text[0]}<br />{quote.text[1]}
      </p>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <SectionWrapper className="bg-[#191b1e] flex flex-col gap-[100px] items-start">
      <div className="flex flex-col gap-[60px] items-start text-white tracking-[-0.5px] w-full max-w-[837px]">
        <h2 className="font-bold text-[32px] md:text-[40px] leading-[1.22] not-italic">
          서대문구 자취생을 위한 필수 체크리스트
        </h2>
        <p className="font-light text-[18px] md:text-[20px] leading-[1.3] not-italic">
          자취방 계약 후 후회하는 건, 결국 그때 못 본 작은 것들 때문입니다.<br />
          이 체크리스트는 먼저 살아본 자취생들의 후회 경험과<br />
          서대문구의 동네 특성을 담아, 놓치면 안 될 것만 모았습니다.
        </p>
      </div>

      <div className="flex flex-col gap-[30px] items-start w-full">
        <div className="bg-[#0a607d] w-full h-[515px] rounded-[8px] overflow-clip relative">
          {ROWS.map((row, i) => (
            <div key={i} className={cn('absolute flex gap-[24px] items-center', ROW_OFFSETS[i])}>
              {row.map((quote, j) => (
                <QuoteCard key={j} quote={quote} />
              ))}
            </div>
          ))}
          <div className="absolute left-0 right-0 h-[289px] bg-gradient-to-b from-transparent to-[#191b1e] top-[226px]" />
        </div>

        <div className="flex flex-col gap-9 items-start max-w-[837px]">
          <h3 className="font-bold text-[28px] md:text-[30px] text-white tracking-[-0.5px] leading-[1.22] not-italic">
            설문을 통해 기준을 세웠습니다.
          </h3>
          <p className="font-light text-[18px] md:text-[20px] text-white tracking-[-0.5px] leading-[1.3] not-italic">
            설문조사를 통해 자취방을 구할 때 후회했던 경험을 수집하고,<br />
            실제 선택에 도움이 되는 기준으로 정리했습니다.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
