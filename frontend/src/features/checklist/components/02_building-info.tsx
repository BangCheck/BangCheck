import { SelectCard, EmojiCard, SectionHeader, FieldLabel, TextInput } from './ui/shared';

export interface BuildingInfoData {
  buildingType: string | null;
  elevator: '있음' | '없음' | null;
  floorLevel: string | null;
  floorDirect: string;
  direction: string | null;
  options: string[];
}

interface Props {
  data: BuildingInfoData;
  onChange: <K extends keyof BuildingInfoData>(key: K, value: BuildingInfoData[K]) => void;
}

const BUILDING_TYPES = ['원룸', '투룸', '빌라', '오피스텔', '아파트', '고시원'];
const DIRECTIONS = ['남향', '동향', '서향', '북향'];
const OPTION_LIST = ['에어컨', '세탁기', '냉장고', '가스레인지', '인덕션', '전자레인지', '침대', '책상', '옷장'];

export default function BuildingInfo({ data, onChange }: Props) {
  const toggleOption = (v: string) =>
    onChange('options', data.options.includes(v) ? data.options.filter((x) => x !== v) : [...data.options, v]);

  return (
    <div className="flex flex-col gap-10">

      {/* 건물 정보 */}
      <section>
        <SectionHeader title="건물 정보" />
        <div className="flex flex-col gap-5">

          <div>
            <FieldLabel>건물 유형</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BUILDING_TYPES.map((t) => (
                <SelectCard key={t} label={t} active={data.buildingType === t} onClick={() => onChange('buildingType', data.buildingType === t ? null : t)} />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>엘리베이터</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['있음', '없음'] as const).map((v) => (
                <EmojiCard key={v} emoji={v === '있음' ? '😊' : '😞'} label={v} active={data.elevator === v} onClick={() => onChange('elevator', data.elevator === v ? null : v)} />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>층수</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {(['반지하', '저층', '중층', '고층'] as const).map((v) => (
                <SelectCard key={v} label={v} active={data.floorLevel === v} onClick={() => onChange('floorLevel', data.floorLevel === v ? null : v)} className="flex-1 min-w-[80px]" />
              ))}
              <div className="flex-1 min-w-[120px]">
                <TextInput value={data.floorDirect} onChange={(v) => onChange('floorDirect', v)} placeholder="직접 입력" suffix="층" type="number" />
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>방향</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIRECTIONS.map((v) => (
                <SelectCard key={v} label={v} active={data.direction === v} onClick={() => onChange('direction', data.direction === v ? null : v)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 옵션 */}
      <section>
        <SectionHeader title="옵션 (다중 선택)" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OPTION_LIST.map((opt) => (
            <SelectCard key={opt} label={opt} active={data.options.includes(opt)} onClick={() => toggleOption(opt)} />
          ))}
        </div>
      </section>
    </div>
  );
}
