/**
 * SWYP 컨벤션 규칙 판정 — 순수 함수.
 *
 * 왜 워크플로에서 뜯어냈나
 *   규칙이 compliance-guard.yml 안의 github-script 블록에 하드코딩돼 있었다.
 *   그 형태에는 두 가지 문제가 있었다.
 *     1. 테스트할 수 없다. 규칙이 맞는지 확인하려면 PR을 열어보는 수밖에 없었고,
 *        그래서 "301번째 파일은 검사하지 않는다" 같은 결함이 오래 남아 있었다.
 *     2. _COMPLIANCE-SPEC.yaml이 스스로를 "Used by: GitHub Actions"라고 선언하는데
 *        실제로는 아무도 읽지 않았다. 선언과 실행이 갈린 채 굳었다.
 *   이 모듈은 네트워크를 모른다. 입력을 받아 판정만 낸다. 그래서 node --test로
 *   전 규칙을 검사할 수 있고, 규칙의 정본은 spec 하나가 된다.
 *
 * 계약
 *   evaluate(ctx, spec) -> { findings: Finding[] }
 *   Finding = { rule, severity: 'error'|'warning'|'info', message, ... }
 *
 * 규칙 정본은 _wood/workflows/_compliance-spec.yaml 이다.
 * 여기에는 "어떻게 판정하는가"만 있고 "무엇을 요구하는가"는 없다.
 * 임계값·패턴·활성 여부를 이 파일에 적으면 그 순간 정본이 둘이 된다.
 */

/** spec에 enabled로 선언됐는데 여기 구현이 없으면 조용히 넘어가지 않는다. */
const IMPLEMENTED = new Set([
  'branch_naming',
  'issue_linkage',
  'commit_type',
  'commit_issue_ref',
  'pr_template',
  'issue_labels',
  'pr_size',
  'forbidden_files',
  'protected_files_mention',
]);

/** 표준 Git revert 커밋. `git revert`가 만드는 형태라 사람이 고칠 수 없다. */
const REVERT_COMMIT = /^Revert ".*"$/;
const MERGE_COMMIT = /^Merge /;

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(escaped);
}

function firstLine(message) {
  return String(message || '').split('\n')[0];
}

function bodyOf(message) {
  const parts = String(message || '').split('\n');
  return parts.slice(1).join('\n');
}

/**
 * @param {object} ctx
 *   branch    {string}   PR head 브랜치명
 *   body      {string}   PR 본문
 *   commits   {Array<{sha:string, message:string}>}  전체 (페이지네이션 완료본)
 *   files     {Array<{filename:string, additions:number, deletions:number}>} 전체
 *   issue     {{number:number, labels:string[]}|null} closes 로 연결된 이슈
 * @param {object} spec  _COMPLIANCE-SPEC.yaml 파싱 결과
 */
export function evaluate(ctx, spec) {
  const findings = [];
  const rules = (spec && spec.rules) || {};

  const add = (rule, extra) => {
    const severity = (rules[rule] && rules[rule].severity) || 'warning';
    findings.push({ rule, severity, ...extra });
  };

  // spec이 켜라고 한 규칙에 구현이 없으면 그것 자체가 결함이다.
  // 이 검사가 없으면 spec에 규칙을 추가해도 아무 일이 안 일어나고,
  // 추가한 사람은 검사가 도는 줄로 안다.
  for (const [name, rule] of Object.entries(rules)) {
    if (rule && rule.enabled && !IMPLEMENTED.has(name)) {
      findings.push({
        rule: 'spec_contract',
        severity: 'error',
        message: `spec이 '${name}'을 enabled로 선언했으나 실행기에 구현이 없다`,
        fix: '규칙을 구현하거나 spec에서 enabled: false 로 명시하라',
      });
    }
  }

  const on = (name) => rules[name] && rules[name].enabled;

  // ── branch_naming ──────────────────────────────────────────
  if (on('branch_naming')) {
    const pattern = new RegExp(rules.branch_naming.pattern);
    if (!pattern.test(ctx.branch)) {
      add('branch_naming', {
        message: `브랜치명 '${ctx.branch}' 이 컨벤션 위반`,
        expected: rules.branch_naming.description,
        examples: rules.branch_naming.examples_good,
        fix: 'git branch -m {correct-name} && git push --force-with-lease',
      });
    }
  }

  // ── issue_linkage ──────────────────────────────────────────
  if (on('issue_linkage')) {
    const pattern = new RegExp(rules.issue_linkage.pattern, 'i');
    if (!pattern.test(ctx.body || '')) {
      add('issue_linkage', {
        message: 'PR body에 `closes #N` 누락',
        fix: 'PR description 편집 → body에 `closes #{이슈번호}` 추가',
      });
    }
  }

  // ── commit_type ────────────────────────────────────────────
  if (on('commit_type')) {
    const pattern = new RegExp(rules.commit_type.pattern);
    const bad = (ctx.commits || []).filter((commit) => {
      const line = firstLine(commit.message);
      // revert·merge는 도구가 만드는 메시지다. 사람에게 고치라고 할 수 없는 것을
      // 위반으로 세면 경고가 배경이 되어 나머지 신호까지 죽는다.
      if (REVERT_COMMIT.test(line) || MERGE_COMMIT.test(line)) return false;
      return !pattern.test(line);
    });
    if (bad.length > 0) {
      add('commit_type', {
        message: `${bad.length}개 커밋이 컨벤션 위반 (검사 ${(ctx.commits || []).length}개)`,
        details: bad.map((c) => `  - ${String(c.sha).substring(0, 7)}: ${firstLine(c.message)}`).join('\n'),
        fix: 'git rebase -i로 메시지 수정',
      });
    }
  }

  // ── commit_issue_ref ───────────────────────────────────────
  if (on('commit_issue_ref')) {
    const pattern = new RegExp(rules.commit_issue_ref.pattern);
    const bad = (ctx.commits || []).filter((commit) => {
      const line = firstLine(commit.message);
      if (REVERT_COMMIT.test(line) || MERGE_COMMIT.test(line)) return false;
      return !pattern.test(bodyOf(commit.message));
    });
    if (bad.length > 0) {
      add('commit_issue_ref', {
        message: `${bad.length}개 커밋 본문에 이슈 번호(#N)가 없다`,
        details: bad.map((c) => `  - ${String(c.sha).substring(0, 7)}: ${firstLine(c.message)}`).join('\n'),
      });
    }
  }

  // ── pr_template ────────────────────────────────────────────
  if (on('pr_template')) {
    const missing = (rules.pr_template.required_sections || [])
      .filter((source) => !new RegExp(source, 'm').test(ctx.body || ''))
      .map((source) => source.replace(/\^##\\s\+/, '## ').replace(/\\s\+/g, ' '));
    if (missing.length > 0) {
      add('pr_template', {
        message: `PR 템플릿 섹션 누락: ${missing.join(', ')}`,
        fix: '.github/PULL_REQUEST_TEMPLATE.md 의 섹션을 따르라',
      });
    }
  }

  // ── issue_labels ───────────────────────────────────────────
  if (on('issue_labels')) {
    if (ctx.issue) {
      const labels = ctx.issue.labels || [];
      const missing = (rules.issue_labels.required_label_prefixes || [])
        .filter((prefix) => !labels.some((label) => String(label).startsWith(prefix)));
      if (missing.length > 0) {
        add('issue_labels', {
          message: `연결된 이슈 #${ctx.issue.number} 라벨 누락: ${missing.map((p) => `${p}*`).join(', ')}`,
          fix: `gh issue edit ${ctx.issue.number} --add-label "..."`,
        });
      }
    }
  }

  // ── pr_size ────────────────────────────────────────────────
  // 자동 생성 파일은 사람이 줄일 수 없다. spec의 exceptions를 실제로 적용한다.
  if (on('pr_size')) {
    const exceptions = (rules.pr_size.exceptions || [])
      .map((item) => globToRegExp(item.pattern));
    const counted = (ctx.files || []).filter(
      (file) => !exceptions.some((re) => re.test(file.filename)),
    );
    const changed = counted.reduce(
      (sum, file) => sum + (file.additions || 0) + (file.deletions || 0), 0,
    );
    const thresholds = rules.pr_size.thresholds || {};
    const excluded = (ctx.files || []).length - counted.length;
    const note = excluded > 0 ? ` (자동 생성 ${excluded}개 제외)` : '';
    if (thresholds.exceed != null && changed > thresholds.exceed) {
      add('pr_size', {
        message: `PR 변경 라인 ${changed}${note} — 상한 ${thresholds.exceed} 초과`,
        fix: 'PR을 작은 단위로 분할',
      });
    } else if (thresholds.caution != null && changed > thresholds.caution) {
      add('pr_size', {
        message: `PR 변경 라인 ${changed}${note} — 권장 ${thresholds.caution} 초과`,
        fix: '가능하면 PR을 나누는 것을 고려하라',
      });
    }
  }

  // ── forbidden_files ────────────────────────────────────────
  if (on('forbidden_files')) {
    const patterns = (rules.forbidden_files.patterns || []).map((p) => new RegExp(p));
    const hits = (ctx.files || [])
      .filter((file) => patterns.some((re) => re.test(file.filename)))
      .map((file) => file.filename);
    if (hits.length > 0) {
      add('forbidden_files', {
        message: `금지된 파일 포함: ${hits.join(', ')}`,
        fix: 'git rm --cached {file} && .gitignore에 추가',
      });
    }
  }

  // ── protected_files_mention ────────────────────────────────
  // 판정은 protected-files.yml이 소유한다. 여기서는 위반을 만들지 않는다.
  // spec이 이 규칙을 enabled로 두더라도 findings는 비어 있는 것이 정상이다.

  return { findings };
}

export function summarize(findings) {
  return {
    errors: findings.filter((f) => f.severity === 'error'),
    warnings: findings.filter((f) => f.severity === 'warning'),
    infos: findings.filter((f) => f.severity === 'info'),
  };
}
