# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-03T21:19:37.704131+00:00
- Finished at (UTC): 2026-08-03T21:22:50.944968+00:00

## Original task / label

pr-policy-review

## Final prompt

```text
너는 이 문서의 교차 검토자다. 저자는 Claude이고 너는 반대 provider로서 반박하는 자리에 있다.
통과시키지 마라. REVISE 관점으로 봐라.

## 대상
/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/critical-review-artifacts/pr-policy-review-draft.md
직접 읽어라. (읽기 전용 sandbox다)

## 배경
이 저장소(BangCheck)에는 compliance-guard라는 GitHub Action이 있다.
PR의 브랜치명·이슈링크·커밋형식·PR템플릿·PR크기를 검사해 error/warning을 낸다.
사용자가 "규칙이 과하다"고 판단해 개선안을 요구했고, 위 문서가 그 답이다.

문서가 보장해야 하는 것:
1. 모든 주장에 1차 출처(공식 기여 가이드) 근거가 붙어야 한다
2. 관행을 "글로벌 표준"이라 단정하지 않아야 한다
3. Conventional Commits와 "좋은 커밋 메시지"를 구별해야 한다
4. 메일 패치 방식(Linux/Git)과 GitHub PR 방식을 구별해야 한다
5. 형식 준수보다 리뷰 가능성·추적성·안전성·검증 가능성을 우선해야 한다
6. 요약이 아니라 실제로 실행 가능한 정책이어야 한다

참고로 이 저장소에서 함께 확인된 사실:
- pull_request 트리거 워크플로는 compliance-guard와 protected-files 둘뿐이다
- 빌드는 deploy-frontend.yml에 있고 트리거가 push다 (머지 후 실행)
- PR에서 테스트를 돌리는 워크플로는 없다
- squash/merge commit/rebase가 모두 허용돼 있다
- 열린 이슈가 0건이다
- 실제 판정은 .github/workflows/compliance-guard.yml의 인라인 정규식이 한다
  (_wood/workflows/_compliance-spec.yaml은 선언일 뿐 강제하지 않는다)
필요하면 이 파일들도 직접 읽어 대조해라.

## 저자가 스스로 표기한 한계 (여기 말고 다른 데를 봐라)
- 크기 가중치 수치(x0.3, x3.0)와 임계값(예외율 20%, 크기점수÷20)은 실측 보정값이 아님
- 팀이 실제로 어느 병합 전략을 쓰는지 미확인
- backend 테스트를 CI에 붙일 때의 소요·안정성 미측정

## 네가 찾아야 할 것
1. **근거 오독**: 인용한 공식 문서의 문장을 문맥과 다르게 쓴 곳.
   특히 Linux/Git의 메일 패치 맥락을 GitHub PR 결론으로 잘못 옮긴 곳이 있는지.
2. **출처와 결론의 비약**: 출처가 말하지 않은 것을 출처가 말한 것처럼 쓴 곳.
   "확인하지 못했다"고 써야 할 자리에 단정한 곳.
3. **자기모순**: 문서 안에서 서로 어긋나는 주장.
   예를 들어 §8에서 squash면 commit_type이 무의미하다고 하면서
   §11에서 다른 근거로 같은 결론을 내는 식의 중복·충돌.
4. **실행 불가능성**: 제안한 정책 중 실제로 GitHub Actions로 구현할 수 없거나,
   구현 비용이 효과를 넘는 것. 특히 §7의 위험 가중 점수, §6의 breaking change 감지,
   §9의 예외 감사 로그.
5. **놓친 반례**: 이 문서의 결론과 반대되는 실제 사례.
   브랜치명이나 이슈 링크를 강제해서 실제로 이득을 본 프로젝트가 있는가?
   PR 크기 상한을 실제로 운영하는 조직이 있는가?
6. **위험한 조언**: §8의 상황별 수정 가이드에 틀린 것이 있는지.
   git 동작에 대한 사실 오류가 있는지 (특히 --force-with-lease의 한계,
   git branch -m 후 push가 PR head에 미치는 영향).
7. **누락**: 사용자가 요구한 18개 관점 중 답하지 않았거나 얕게 답한 것.

## 출력 형식
발견마다:
- [MAJOR|MINOR] 제목
- 위치: 문서의 절 번호
- 무엇이 틀렸나
- 왜 틀렸나 (근거)
- 어떻게 고쳐야 하나

마지막에 한 줄 총평과 REVISE/ACCEPT 판정.
칭찬은 쓰지 마라. 문제만 써라.

```

## Final response

```text
[MAJOR] 근거의 추적 가능성이 없다  
위치: §8, 문서 전반  
무엇이 틀렸나: S1~S8은 출처명과 발췌만 있고 URL·버전·절·문단별 연결이 없다. “모든 주장에 1차 출처”라는 선언을 검증할 수 없다.  
왜 틀렸나: 동일 출처라도 메일 패치, GitHub PR, 사내 CL의 적용 범위가 다르다. 발췌표만으로 이후의 정책 결론을 뒷받침할 수 없다.  
어떻게 고쳐야 하나: 각 외부 사실 뒤에 공식 URL과 정확한 절을 붙이고, 정책적 추론은 `추론`으로 분리하라.

[MAJOR] 실제 강제 규칙과 선언 규칙을 혼동했다  
위치: §1, §2, §11  
무엇이 틀렸나: `commit_issue_ref` 제거를 핵심 변경처럼 다루지만, 실제 `compliance-guard.yml`은 커밋 본문의 `#N`을 검사하지 않는다. 반대로 `skip-compliance`는 “미구현”이 아니라 현재 전체 검사를 건너뛴다.  
왜 틀렸나: 정책 문서 `_compliance-spec.yaml`과 실제 인라인 구현이 다르다. 존재하지 않는 강제를 제거해도 행동은 바뀌지 않으며, 실제 전면 우회는 방치된다.  
어떻게 고쳐야 하나: “선언됨/실행됨/미실행됨” 표를 먼저 만들고, 구현 정본을 하나로 정한 뒤 모든 결론을 그 표에 연결하라.

[MAJOR] `skip-compliance`는 보안 규칙까지 우회하며, 제안은 이를 해결하지 않는다  
위치: §9, §11  
무엇이 틀렸나: 현 워크플로는 `skip-compliance` 라벨이 있으면 `forbidden_files`까지 포함한 모든 검사를 skip한다. 초안은 예외의 Blocker 불가 원칙을 말하지만 이 기존 우회를 제거·분리하는 실행안이 없다.  
왜 틀렸나: GitHub Actions에서 skip된 job은 성공으로 취급될 수 있다. 또한 현재 트리거에는 `labeled`가 없어 라벨을 붙이는 순간 재검사도 보장되지 않는다.  
어떻게 고쳐야 하나: Blocker 검사는 예외 워크플로와 분리하고 항상 실행하라. 라벨 예외는 `labeled`/`unlabeled`를 포함해 재판정하고, 허용된 예외 규칙만 건너뛰게 하라. [GitHub status-check 문서](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

[MAJOR] “브랜치 규칙을 강제하는 대형 프로젝트는 없다”는 과잉 단정이다  
위치: §2.1, §3 branch_naming, §11.3  
무엇이 틀렸나: S3~S5 세 프로젝트에 규칙이 없다는 조사 결과를 “어느 대형 프로젝트도 강제하지 않는다”로 확장했다.  
왜 틀렸나: GitLab은 브랜치명 검증 push rule을 공식 기능으로 제공하고, Toil은 PR 브랜치에 `issues/<번호>-...` 형식을 요구한다. SurrealDB도 issue/type/description 형식을 공식 기여 가이드에 둔다. 브랜치 규칙의 가치가 보편 표준이라는 뜻은 아니지만, “이득을 본 사례가 없다”는 결론은 성립하지 않는다.  
어떻게 고쳐야 하나: “조사한 K8s·Rust·React에는 없었다”로 한정하고, 추적·자동화 연동이 있는 팀에는 브랜치 규칙이 유효할 수 있음을 반례와 함께 적어라. [GitLab push rules](https://docs.gitlab.com/user/project/repository/push_rules/), [Toil 기여 가이드](https://toil.readthedocs.io/en/latest/contributing/contributing.html), [SurrealDB 기여 가이드](https://github.com/surrealdb/surrealdb/blob/main/CONTRIBUTING.md)

[MAJOR] Kubernetes 인용을 “커밋의 이슈 참조 금지”로 오독했다  
위치: §2.3, §11.3  
무엇이 틀렸나: K8s가 금지하는 것은 커밋 메시지의 GitHub closing keyword(`fixes #N` 등)이지 모든 `#N` 참조가 아니다. 같은 문서는 커밋 본문에서 이슈를 reference로 연결할 수 있다고 말한다.  
왜 틀렸나: 현재 선언 규칙 `commit_issue_ref`는 단순 `#[0-9]+`이며, closing keyword 검사와 동치가 아니다. Rust도 “PR 설명에 `closes`를 선호”한다고 했지 일반 참조를 금지하지 않는다.  
어떻게 고쳐야 하나: closing keyword와 단순 reference를 분리하고, 실제로는 해당 규칙이 미구현이라는 사실부터 반영하라. [Kubernetes PR guide](https://www.kubernetes.dev/docs/guide/pull-requests/), [Rust contribution procedures](https://rustc-dev-guide.rust-lang.org/contributing.html)

[MAJOR] Linux 메일 패치 규칙을 GitHub PR 차단 규칙으로 과도하게 번역했다  
위치: §4.2, §4.5, §10  
무엇이 틀렸나: “S1이 규정한 그대로”라며 모든 중간 PR에 테스트 통과·사용자 동작 보전·안전한 rollback을 요구한다.  
왜 틀렸나: Linux 원문은 메일 패치 시리즈의 각 패치가 build/run 가능해야 한다고 할 뿐, 나머지 세 조건이나 GitHub stacked PR의 병합 정책을 규정하지 않는다. 원문은 패치 의존성도 허용한다.  
어떻게 고쳐야 하나: 메일 패치의 원문 요구와 GitHub PR에 대한 추가 정책을 분리하고, 후자는 BangCheck의 CI·병합 모델에 맞춘 독립 근거와 함께 제안하라. [Linux submitting-patches](https://docs.kernel.org/6.12/process/submitting-patches.html)

[MAJOR] Conventional Commits의 가치 조건을 임의로 축소했고 저장소 사실도 틀렸다  
위치: §3 commit_type, §11.3  
무엇이 틀렸나: changelog/semver/publish 소비자가 없으면 규약의 근거가 사라진다고 단정한다. 또 “자동 배포 트리거도 없다”고 쓴다.  
왜 틀렸나: Conventional Commits는 사람과 기계가 읽을 수 있는 의미 부여 규약이며, 열거한 자동화 목적이 전부라는 근거는 없다. 저장소에는 `push` 시 프런트엔드와 백엔드를 배포하는 워크플로가 있다.  
어떻게 고쳐야 하나: “현재 type 기반 release 자동화는 확인하지 못했다”로 제한하라. 커밋 형식은 실제 병합 방식·릴리스 소비자·이력 검색 요구를 측정한 뒤 선택하라. [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

[MAJOR] 이슈 링크 등급이 문서 안에서 충돌한다  
위치: §3 issue_linkage, §6, §11.2, §11.5  
무엇이 틀렸나: §3은 Warning을 권장하지만 migration/breaking에만 Error라 하고, §6·§11은 일반 `issue_linkage`를 Error 유지라 한다. §11.5는 다시 issue linkage를 머지 차단에서 내리라고 한다.  
왜 틀렸나: 동일 규칙의 기본 severity와 승격 조건이 하나로 결정되지 않았다.  
어떻게 고쳐야 하나: “기본 Warning, 고위험 변경에서만 Error” 또는 “기본 Error + 검증 가능한 면제” 중 하나를 선택하고 표·예시·최종 우선순위를 모두 맞춰라.

[MAJOR] PR 크기 정책의 차단 임계값이 서로 다르며 계산 예시도 틀렸다  
위치: §3 pr_size, §6, §7, §10  
무엇이 틀렸나: 3,000줄, 2,500점, “Warning이되 3,000 초과 Error”가 병존한다. 출력 예시의 항목 합은 1,268이고 분산도 74를 더하면 1,342인데, 크기점수는 1,268로 표시하면서 리뷰 시간은 67분(1,342÷20)으로 계산했다.  
왜 틀렸나: 실행자가 어떤 값을 차단해야 하는지 정할 수 없다.  
어떻게 고쳐야 하나: 점수 정의·우선순위·반올림·동일 파일의 다중 분류·threshold를 하나의 의사코드와 테스트 케이스로 고정하라. 보정 전에는 Error가 아니라 Warning으로 한정하라.

[MAJOR] 위험 가중치 모델은 실행 가능한 판정 명세가 아니다  
위치: §7  
무엇이 틀렸나: “포맷 전용”, PII·권한·auth, generated, rename 90%, public API/export를 어떻게 안정적으로 판정하는지 없다. `lockfile ×0`은 의존성 변경 자체의 리뷰 위험을 0으로 만든다.  
왜 틀렸나: GitHub API의 파일 통계만으로 의미적 변경·PII·권한·포맷 전용을 분류할 수 없다. 경로/파일명 heuristic은 오탐·누락이 크고, 테스트 줄 수를 낮게 세면 무의미한 테스트 추가를 유도한다.  
어떻게 고쳐야 하나: 1차 구현은 rename·완전 삭제·명시적 generated 경로만 판정해 advisory로 내고, lockfile은 별도 dependency review로 다뤄라. 의미적 위험은 소유자 매핑 또는 전용 분석 도구 없이는 자동 차단하지 마라.

[MAJOR] Build/Test를 Blocker로 만들 실행 경로가 없다  
위치: §1, §6, §11.4  
무엇이 틀렸나: “구현 난이도 낮음”이라고 하지만 프런트엔드 build는 머지 후 push 배포에만 있고, 백엔드 배포는 `bootJar -x test`다. PR용 path matrix, JDK/Node setup, DB/Flyway 의존성, timeout·flake 기준, required check 등록이 제안되지 않았다.  
왜 틀렸나: Actions job을 추가하는 것만으로 병합은 막히지 않는다. branch protection/ruleset에서 해당 check를 required로 지정해야 한다.  
어떻게 고쳐야 하나: frontend/backend별 PR CI 명령·환경·실패 기준을 실제로 측정하고, check 이름 및 required-status/ruleset 변경을 정책의 필수 단계로 명시하라. [GitHub protected-branch 문서](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

[MAJOR] migration 및 breaking-change 검사는 “문구 존재”를 안전성으로 오인한다  
위치: §6, §7, §11.4  
무엇이 틀렸나: migration의 `Rollback:` 헤딩, breaking-change 라벨/본문만으로 Blocker/Error를 해소하게 한다.  
왜 틀렸나: Flyway migration은 rollback이 항상 안전하거나 가능한 것이 아니다. 본문 텍스트는 데이터 백업·forward recovery·staging 검증을 증명하지 않는다. public API breaking change도 OpenAPI baseline이나 호환성 검사 없이 일반 diff에서 자동 감지할 수 없다.  
어떻게 고쳐야 하나: migration은 실행된 migration 검증, 백업/복구·forward-fix 계획, 담당 승인으로 구성하라. API는 생성된 OpenAPI spec의 baseline diff를 도입한 뒤에만 자동 판정을 논의하라.

[MAJOR] 예외 권한·감사 로그 설계가 GitHub 권한 모델과 맞지 않는다  
위치: §9  
무엇이 틀렸나: `emergency`·`initial-import` 라벨을 “Admin만 부여”한다고 하지만 GitHub는 라벨별 권한을 제공하지 않는다. Triage 권한도 라벨을 적용/제거할 수 있다. “월 집계”의 저장 위치, 수집 주체, 변경 불가능성, 20%의 분모도 없다.  
왜 틀렸나: 라벨은 승인 증거가 아니며, 현재 CODEOWNERS는 저장소 전체가 아니라 일부 보호 경로만 소유한다.  
어떻게 고쳐야 하나: GitHub review의 승인자/API identity를 확인하는 별도 승인 규칙을 만들고, 예외 사유·승인 SHA·승인자·시각을 append-only issue comment 또는 외부 감사 저장소에 기록하라. [GitHub repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations/repository-roles-for-an-organization), [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

[MAJOR] 추적성 확장안은 검증 가능한 추적성이 아니다  
위치: §3 issue_linkage, §5, §9  
무엇이 틀렸나: 임의의 `Refs:`, route, 10자 이상 `No-issue:`면 Error를 통과시킨다.  
왜 틀렸나: 존재하지 않는 문서 경로·route·형식적 사유도 모두 통과하므로, “리뷰 성립성/추적성”이라는 차단 근거를 충족하지 못한다.  
어떻게 고쳐야 하나: issue 번호는 API로 존재를 확인하고, repo 내부 문서는 base SHA에서 존재 여부를 확인하라. `No-issue`는 Warning 면제와 사후 리뷰 대상으로 두고, 고위험 변경에는 승인된 change record를 요구하라.

[MAJOR] §8의 Git 수정 가이드는 사실을 과장하고 절대화한다  
위치: §8  
무엇이 틀렸나: `git branch -m` 뒤 push가 반드시 새 브랜치를 만들고 PR을 다시 열게 한다고 썼다. 로컬 rename 자체는 GitHub PR에 영향을 주지 않으며, 원격 결과는 push refspec에 따라 새 브랜치 생성·기존 브랜치 갱신·실패로 갈린다. 또 force-push가 리뷰 코멘트를 “통째로 잃게” 한다고 단정한다.  
왜 틀렸나: GitHub에서 원격 head branch를 rename하면 PR은 닫히지만, 별도 새 브랜치 push는 그와 다른 동작이다. Rust도 필요한 update에는 `--force-with-lease`와 변경 코멘트를 권한다.  
어떻게 고쳐야 하나: “원격 head를 바꾸거나 삭제하면 PR이 닫힐 수 있다”, “force-push는 outdated review와 approval 재검토를 유발할 수 있다”로 정확히 쓰고, PR 상태·공유 여부·refspec별 명령을 분리하라. [GitHub branch rename](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch), [Rust guide](https://rustc-dev-guide.rust-lang.org/contributing.html)

[MINOR] merge queue 도입안이 S8의 필수 조건을 누락했다  
위치: §2.6, §11.4  
무엇이 틀렸나: merge queue를 권하면서 필수 Actions에 `merge_group` 트리거를 추가하는 계획이 없다.  
왜 틀렸나: queue에서 병합 후보 SHA에 검사를 돌리지 않으면 PR check만 통과한 뒤 조합 상태가 검증되지 않는다.  
어떻게 고쳐야 하나: CI workflow의 `pull_request`와 `merge_group` event, required check 이름, queue 도입 순서를 함께 명시하라.

[MINOR] 실제 PR 템플릿과 제안 템플릿의 전환 계획이 없다  
위치: §3 pr_template, §5  
무엇이 틀렸나: 현재 `.github/PULL_REQUEST_TEMPLATE.md`는 `What/Why/Test` 구조가 아닌데 compliance는 그 세 헤딩을 검사한다. 새 템플릿은 또 `Problem/Verification` 구조다.  
왜 틀렸나: Action·현재 템플릿·새 템플릿이 동시에 서로 다른 계약을 요구한다.  
어떻게 고쳐야 하나: 템플릿 변경, parser의 허용 헤딩, 기존 열린 PR의 호환 정책을 하나의 rollout 단계로 작성하라.

총평: 근거 범위를 넘는 단정, 실제 구현과의 불일치, 미정의 자동 판정과 예외 우회 때문에 실행 가능한 정책 문서가 아니다. **REVISE**
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
