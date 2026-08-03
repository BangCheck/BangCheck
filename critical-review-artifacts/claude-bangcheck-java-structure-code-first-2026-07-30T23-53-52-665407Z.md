# claude critical-review artifact

- Provider: claude
- Model: claude-opus-5
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
- Exit code: 1
- Resolved CLI: /Users/jonghoPro/.local/bin/claude
- Started at (UTC): 2026-07-30T23:34:02.094880+00:00
- Finished at (UTC): 2026-07-30T23:53:52.660410+00:00

## Original task / label

bangcheck-java-structure-code-first

## Final prompt

```text
너는 BangCheck 백엔드 재설계의 선행 아키텍트다. 코드를 절대 수정하지 말고 읽기 전용으로 분석·설계만 수행하라.

목표:
- 테스트 인프라를 더 만드는 것이 아니라 실제 Java 기능 코드를 먼저 재설계한다.
- 첫 vertical slice는 "방 등록 + 체크리스트 결과 등록 계약"이다.
- 이 설계가 이후 Project Atlas에서 Front → API → Backend, 예외·테스트·담당자·Issue로 시각화 가능한 구조적 정본이 되어야 한다.
- 현행 Java 17 / Spring Boot 3.2.5를 유지한다. Java 25·Boot 업그레이드는 이번 설계/구현의 blocker가 아니다.
- 공개 API route, 응답 계약, Flyway schema를 승인 없이 변경하지 않는다.

반드시 직접 읽을 코드:
- backend/src/main/java/com/room/backend/api/room/controller/RoomController.java
- backend/src/main/java/com/room/backend/api/room/service/RoomService.java
- backend/src/main/java/com/room/backend/api/room/dto/**
- backend/src/main/java/com/room/backend/domain/room/**
- backend/src/main/java/com/room/backend/domain/checklist/**
- backend/src/main/java/com/room/backend/global/exception/**
- backend/src/main/java/com/room/backend/global/auth/**
- backend/src/test/**
- backend/build.gradle
- 현재 git status와 git diff도 읽되, 아직 완성되지 않은 Observable Baseline 계측 작업을 제품 구조의 모범답안으로 간주하지 마라.

외부 기획 정본의 핵심 계약:
- Story 1.1: 방 등록/체크리스트 등록을 첫 코드 vertical slice로 삼는다.
- Composition first. class는 기본 final, 값은 immutable record 우선.
- sealed interface는 서로 다른 필수 상태를 가진 닫힌 변형에만 사용.
- 상속은 코드 재사용 목적으로 금지하고, LSP + 실제 변형 2개 + contract test가 있을 때만 허용.
- interface는 side-effect port, 실제 전략 2개 이상, 또는 공개 application contract에만 둔다. 단일 내부 구현에 습관적으로 붙이지 않는다.
- 전역 core/shared-kernel은 독립 기능 2개에서 의미·불변식·변경 주기가 같다는 증거 전에는 만들지 않는다.
- Spring/JPA/HTTP annotation은 adapter/application boundary에 두고 @Transactional은 use case 경계에 둔다.
- @FeatureRef가 필요하다면 SOURCE-retention metadata만 허용하며 reflection, 분기, 보안 판단에 사용하지 않는다.
- 기존 PATH A/B/C 예외 흐름과 인증 경계를 보존한다.

독립적으로 비교할 선택지:
A. 현재 계층형 구조를 최소 정리
B. 전통적인 Clean/Hexagonal architecture
C. package-by-feature + 얇은 ports/adapters의 vertical slice
필요하면 D를 추가하되 유행어가 아니라 현재 코드 근거를 제시하라.

필수 산출물:
1. 현재 코드 진단: 파일·클래스·메서드 근거, 책임 누수, 결합, 중복, 잘못된 추상화, 유지할 장점.
2. A/B/C를 100점 기준으로 비교표: 변경 안전성, 캡슐화, 재사용성, 인지 부하, Spring 적합성, Atlas 추적성, 점진 이관 난이도. 가중치도 명시.
3. 최종 권고안과 왜 다른 선택지보다 현재 BangCheck에 맞는지.
4. 첫 slice의 구체적인 패키지/클래스 트리. 각 클래스에 final/record/sealed/interface/annotation 여부와 책임을 표기.
5. Controller → UseCase → Domain → Port → Adapter 호출 흐름. 기존 클래스에서 새 클래스로의 매핑.
6. public contract 초안: command/result/value/error/port 메서드 시그니처를 Java 형태로 제시. 과잉 interface와 빈약한 domain model을 피하라.
7. 캡슐화 규칙: 생성·상태변경·검증·repository 접근·transaction 경계. 상속/extends를 쓸 곳과 쓰지 않을 곳을 명시.
8. 예외/인증/동시성/멱등성/DB 실패 시나리오 및 기존 PATH A/B/C와의 연결.
9. 코드 먼저의 이관 순서: 각 단계에서 실제 수정 파일, 보존 계약, 완료 증거. 테스트는 각 코드 단계 뒤에 필요한 최소 검증으로 배치.
10. Project Atlas가 정본을 읽기 위한 최소 metadata 경계. Java domain이 Atlas 때문에 오염되지 않게 설계.
11. 되돌릴 수 없는 결정, 나중으로 미룰 결정, 첫 구현 전에 사람에게 확인할 결정.
12. 결론을 PASS로 포장하지 말고 결함·충돌·누락·비측정성을 MAJOR/MINOR로 끝에 정리하라.

중요:
- 새로운 전역 core, BaseService, BaseEntity, generic repository, 모든 클래스용 interface를 만들지 마라.
- 기존 코드를 실제로 보지 않고 교과서 구조를 제안하면 실패다.
- 구현자가 추가 설계 결정을 하지 않아도 첫 slice 코딩을 시작할 수 있을 정도로 구체적으로 작성하라.
- 한국어로 답하라.

```

## Raw output

```text
세 탐색 에이전트와 직접 읽기가 모두 끝났습니다. 설계 문서를 작성합니다.
API Error: Connection closed mid-response. The response above may be incomplete.
```

## Concise summary

claude 실행 실패(exit 1): 세 탐색 에이전트와 직접 읽기가 모두 끝났습니다. 설계 문서를 작성합니다.
