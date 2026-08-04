/**
 * atlas-snapshot.json이 registry보다 낡았는지 검사한다. 빌드 앞에 선다.
 *
 * 무엇을 막는가
 *   registry의 결함·route·owner를 고친 뒤 `npm run build`만 하면 예전 스냅샷이
 *   그대로 번들되어 PM 화면이 낡은 사실을 보여준다. 화면은 틀렸다고 말하지 않고
 *   그냥 조용히 틀린다 — "확인 안 함"과 구별되지 않는 상태다.
 *
 * 왜 재생성이 아니라 검사인가 (고른 선택지와 이유)
 *   후보는 셋이었다.
 *     (a) build가 스냅샷을 재생성한다  — 항상 최신이지만 python3와 PyYAML이
 *         빌드의 전제가 된다. 지금 프론트 빌드는 node만 있으면 되고, CI와
 *         다른 팀원 기계에 파이썬 환경을 강제하는 순간 빌드 자체가 깨진다.
 *         화면 하나를 최신으로 만들려고 배포 경로 전체를 인질로 잡는 셈이다.
 *     (b) build 앞에서 최신 여부만 검사한다 — 파이썬 없이 node만으로 가능하다.
 *         낡았으면 무엇을 실행해야 하는지 말하고 멈춘다.
 *     (c) 검사를 CI에만 둔다 — 로컬에서는 여전히 낡은 채로 빌드된다.
 *   (b)를 골랐다. 막으려는 것은 "낡은 것이 조용히 나가는 것"이지 "사람이 손으로
 *   재생성하는 것"이 아니다. (b)는 그 하나만 막으면서 빌드의 의존 표면을
 *   node로 유지한다. 재생성은 `npm run atlas:snapshot`으로 남는다.
 *
 * 무엇으로 판정하는가
 *   mtime이 아니라 registry 내용의 sha256이다. git은 파일 시각을 보존하지 않아
 *   새로 clone하면 mtime이 체크아웃 순서대로 사실상 임의로 정해진다. 그러면
 *   mtime 비교는 "낡았다"와 "방금 받았다"를 구별하지 못한다.
 *   해시 정의는 .project-atlas/tools/pm_snapshot.py의 registry_digest()와 같아야 한다 —
 *   두 곳에 적힌 유일한 규칙이니 한쪽을 고치면 반드시 다른 쪽도 고친다.
 *
 * .project-atlas/가 없으면 통과시킨다. AD-12에 따라 그 디렉터리는 별도 저장소로
 * 나갈 예정이고, 나간 뒤에는 스냅샷이 프론트가 받는 계약면일 뿐 여기서 검증할
 * 원천이 없다. 원천이 없는 것을 위반으로 부르면 그때부터 빌드가 못 돈다.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = dirname(FRONTEND_ROOT);
const REGISTRY_DIR = join(REPO_ROOT, '.project-atlas', 'registry');
const SNAPSHOT = join(FRONTEND_ROOT, 'src', 'features', 'research', 'atlas-snapshot.json');

const REGENERATE = 'npm run atlas:snapshot  (필요: pip install -r ../.project-atlas/requirements.txt)';

function registryDigest() {
  const digest = createHash('sha256');
  const files = readdirSync(REGISTRY_DIR).filter((name) => name.endsWith('.yaml')).sort();
  for (const name of files) {
    digest.update(name, 'utf8');
    digest.update('\n');
    digest.update(createHash('sha256').update(readFileSync(join(REGISTRY_DIR, name))).digest('hex'), 'ascii');
    digest.update('\n');
  }
  return digest.digest('hex');
}

function fail(message) {
  console.error(`atlas-snapshot 검사 실패 — ${message}`);
  console.error(`  재생성: ${REGENERATE}`);
  process.exit(1);
}

if (!existsSync(REGISTRY_DIR)) {
  console.log('atlas-snapshot 검사 건너뜀 — .project-atlas/registry가 없다 (AD-12 분리 후 정상)');
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  fail('atlas-snapshot.json이 없는데 registry는 있다');
}

let snapshot;
try {
  snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
} catch (error) {
  fail(`atlas-snapshot.json을 읽을 수 없다: ${error.message}`);
}

const expected = registryDigest();

// 해시가 아예 없는 스냅샷은 이 검사보다 오래된 생성물이다. 통과시키면
// "검사했는데 문제없음"과 "검사할 수 없었음"이 같아 보인다.
if (typeof snapshot.sourceDigest !== 'string') {
  fail('스냅샷에 sourceDigest가 없다 — 이 검사 이전에 구운 생성물이다');
}

if (snapshot.sourceDigest !== expected) {
  fail(
    'registry가 스냅샷보다 새롭다. 이대로 빌드하면 낡은 사실이 화면에 나간다\n'
    + `  스냅샷: ${snapshot.sourceDigest}\n`
    + `  registry: ${expected}`,
  );
}

console.log('atlas-snapshot 검사 통과 — 스냅샷이 registry와 같은 내용에서 나왔다');
