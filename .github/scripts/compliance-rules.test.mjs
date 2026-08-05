/**
 * compliance-rules 회귀 테스트.
 *
 * 무엇을 붙들고 있나
 *   이 규칙들은 전부 "한때 틀렸던 것"이다. 각 테스트는 실제로 났던 오탐·미탐
 *   하나에 대응한다. 규칙을 다시 손댈 때 같은 자리로 되돌아가는 것을 막는다.
 *
 * 실행: node --test .github/scripts/
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluate, summarize } from './compliance-rules.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** spec을 그대로 읽는다. 테스트가 spec 사본을 들고 있으면 정본이 둘이 된다. */
function loadSpec() {
  const raw = readFileSync(join(REPO_ROOT, '_wood/workflows/_compliance-spec.yaml'), 'utf8');
  return parseMinimalYaml(raw);
}

/**
 * PyYAML 없이 spec을 읽기 위한 최소 파서 — 이 파일이 쓰는 형태만 다룬다.
 * 러너에 js-yaml을 설치하지 않으려고 둔다. 실제 워크플로는 yq로 JSON을 만들어
 * 넘기므로, 여기서 파서가 갈리면 테스트가 실행기와 다른 것을 보게 된다.
 * 그래서 워크플로도 이 테스트도 같은 spec 파일 하나만 원천으로 쓴다.
 */
function parseMinimalYaml(text) {
  const lines = text.split('\n');
  const root = {};
  const stack = [{ indent: -1, node: root }];
  let pendingKey = null;

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].node;

    if (line.startsWith('- ')) {
      const value = line.slice(2).trim();
      const target = parent[pendingKey];
      if (Array.isArray(target)) {
        if (value.includes(': ')) {
          const [k, ...rest] = value.split(': ');
          target.push({ [k.trim()]: scalar(rest.join(': ')) });
        } else {
          target.push(scalar(value));
        }
      }
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rest] = match;

    if (rest === '' || rest === '|') {
      const node = {};
      parent[key] = node;
      stack.push({ indent, node });
      pendingKey = key;
      // 값이 리스트인지 맵인지는 다음 줄에서 정해진다.
      parent[key] = node;
      Object.defineProperty(node, '__pending', { value: true, enumerable: false });
      continue;
    }
    parent[key] = scalar(rest);
    pendingKey = key;
  }
  return normalize(root);
}

function scalar(value) {
  const v = String(value).trim().replace(/\s+#.*$/, '');
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  return v.replace(/^['"]|['"]$/g, '');
}

function normalize(node) {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const key of Object.keys(node)) node[key] = normalize(node[key]);
  }
  return node;
}

// 최소 파서가 리스트를 못 만들므로, 테스트가 필요한 리스트 필드는 명시적으로 구성한다.
// 실행기(yq → JSON)와 이 테스트가 같은 값을 보게 하는 것이 목적이라
// enabled/severity/pattern 같은 스칼라는 spec에서 그대로 읽는다.
function specForTest() {
  const parsed = loadSpec();
  const rules = parsed.rules;
  rules.pr_template.required_sections = ['^##\\s+Summary', '^##\\s+Linked Issue', '^##\\s+Changes'];
  rules.issue_labels.required_label_prefixes = ['유형:', '순위:', '상태:'];
  rules.pr_size.thresholds = { caution: 400, exceed: 800 };
  rules.pr_size.exceptions = [{ pattern: 'package-lock.json' }, { pattern: '*.generated.*' }];
  rules.forbidden_files.patterns = [
    '\\.env$', '\\.env\\.local$', '\\.env\\.production$',
    '\\.pem$', '\\.key$', '\\.p12$', '\\.pfx$',
    'credentials\\.json$', 'secrets\\.(json|yaml|yml)$',
  ];
  rules.branch_naming.examples_good = ['feat/5-login-form'];
  return parsed;
}

const SPEC = specForTest();

function ctx(overrides = {}) {
  return {
    branch: 'fix/218-guard-compliance',
    body: '## Summary\nx\n\n## Linked Issue\ncloses #218\n\n## Changes\ny\n',
    commits: [{ sha: 'abc1234', message: 'fix: 무언가를 고친다' }],
    files: [{ filename: 'src/a.ts', additions: 10, deletions: 2 }],
    issue: { number: 218, labels: ['유형:작업'] },
    ...overrides,
  };
}

const rulesFired = (result) => new Set(result.findings.map((f) => f.rule));

test('기준선 — 규약을 지킨 PR은 findings 0건', () => {
  const result = evaluate(ctx(), SPEC);
  assert.deepEqual(result.findings, []);
});

test('spec의 실제 PR 본문 형식을 통과시킨다 (What/Why/Test 오탐 회귀)', () => {
  // 2026-08-05 PR #216에서 실제로 났던 오탐. 팀이 쓰는 형식이 통과해야 한다.
  const body = [
    '## Summary', '요약', '',
    '## Linked Issue', 'closes #215', '',
    '## Changes', '- 변경', '',
    '## Checklist', '- [x] 확인',
  ].join('\n');
  const result = evaluate(ctx({ body }), SPEC);
  assert.ok(!rulesFired(result).has('pr_template'), 'pr_template이 울면 안 된다');
});

test('issue_labels는 비활성 — 라벨이 없어도 울지 않는다', () => {
  // 저장소에 `순위:`·`상태:` 라벨이 없어 통과가 불가능했던 규칙.
  const result = evaluate(ctx({ issue: { number: 1, labels: [] } }), SPEC);
  assert.ok(!rulesFired(result).has('issue_labels'));
});

test('revert 브랜치를 허용한다', () => {
  const result = evaluate(ctx({ branch: 'revert/200-be-directions-rollback' }), SPEC);
  assert.ok(!rulesFired(result).has('branch_naming'));
});

test('규약 밖 브랜치는 여전히 잡는다', () => {
  const result = evaluate(ctx({ branch: 'wave3-fix-home' }), SPEC);
  assert.ok(rulesFired(result).has('branch_naming'));
});

test('표준 revert 커밋 메시지는 commit_type 위반이 아니다', () => {
  const commits = [{ sha: 'd00d', message: 'Revert "feat: 무언가"\n\nThis reverts commit abc.' }];
  const result = evaluate(ctx({ commits }), SPEC);
  assert.ok(!rulesFired(result).has('commit_type'));
});

test('31번째 커밋도 검사한다 (listCommits 첫 페이지 절단 회귀)', () => {
  const commits = Array.from({ length: 30 }, (_, i) => ({
    sha: `ok${i}`, message: 'fix: 정상 커밋',
  }));
  commits.push({ sha: 'bad31', message: '컨벤션 없는 서른한 번째 커밋' });
  const result = evaluate(ctx({ commits }), SPEC);
  assert.ok(rulesFired(result).has('commit_type'), '31번째가 잡혀야 한다');
  assert.match(result.findings[0].details, /bad31/);
});

test('301번째 파일의 금지파일도 잡는다 (per_page 300 절단 회귀)', () => {
  const files = Array.from({ length: 300 }, (_, i) => ({
    filename: `src/f${i}.ts`, additions: 0, deletions: 0,
  }));
  files.push({ filename: 'config/secrets.json', additions: 1, deletions: 0 });
  const result = evaluate(ctx({ files }), SPEC);
  assert.ok(rulesFired(result).has('forbidden_files'), '301번째가 잡혀야 한다');
});

test('pr_size가 자동 생성 파일을 제외한다 (spec exceptions 미반영 회귀)', () => {
  const files = [
    { filename: 'package-lock.json', additions: 5000, deletions: 3000 },
    { filename: 'src/a.ts', additions: 10, deletions: 0 },
  ];
  const result = evaluate(ctx({ files }), SPEC);
  assert.ok(!rulesFired(result).has('pr_size'), 'lock 파일은 세지 않는다');
});

test('pr_size가 caution 임계값도 본다', () => {
  const files = [{ filename: 'src/a.ts', additions: 500, deletions: 0 }];
  const result = evaluate(ctx({ files }), SPEC);
  const finding = result.findings.find((f) => f.rule === 'pr_size');
  assert.ok(finding, 'caution 초과가 잡혀야 한다');
  assert.match(finding.message, /권장 400/);
});

test('closes 누락은 error로 잡는다', () => {
  const body = '## Summary\nx\n\n## Linked Issue\n없음\n\n## Changes\ny';
  const result = evaluate(ctx({ body }), SPEC);
  const { errors } = summarize(result.findings);
  assert.ok(errors.some((f) => f.rule === 'issue_linkage'));
});

test('spec이 켠 규칙에 구현이 없으면 error로 드러난다', () => {
  const broken = JSON.parse(JSON.stringify(SPEC));
  broken.rules.some_future_rule = { severity: 'warning', enabled: true };
  const result = evaluate(ctx(), broken);
  const { errors } = summarize(result.findings);
  assert.ok(errors.some((f) => f.rule === 'spec_contract'), '구현 없는 규칙이 조용히 넘어가면 안 된다');
});
