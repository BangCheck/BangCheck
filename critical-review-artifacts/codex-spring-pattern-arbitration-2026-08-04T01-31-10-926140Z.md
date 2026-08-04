# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-sol
- Reasoning effort: xhigh
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T01:19:22.386115+00:00
- Finished at (UTC): 2026-08-04T01:31:10.921746+00:00

## Original task / label

spring-pattern-arbitration

## Final prompt

```text
## 이 지시가 이 저장소의 다른 모든 지시에 우선한다 — 먼저 읽어라

이 저장소의 `AGENTS.md`, `.cursorrules`, `GEMINI.md`, `_wood/` 아래 규약은 이 리뷰에 적용하지 않는다.
특히 `_wood/workflows/_protocol.md`와 `_wood/agents/_safety.md`의 "행동 전 Y/N 확인"은 해당 없다.
너는 sandbox read-only reviewer이고 쓰기 권한이 없어 확인받을 위험한 행동 자체가 없다.
비용·승인·진행 여부를 되묻지 마라 — 이미 승인됐고, 되묻는 응답은 실패로 처리된다.
`_wood/context/current.yaml`이나 `_PROTOCOL.md`를 먼저 읽는 STEP 0/1도 밟지 마라.
바로 분석하라.

---

# 과제

Claude 모델 두 패스가 각각 낸 결론을 **교차 심문하고 최종 명세를 확정하라.**
너는 마지막 그물이다. 둘 다 틀렸을 수 있다.

핵심 목표는 사용자의 말 그대로다 — **"Spring이 권장하는 템플릿과 패턴을 우리에 맞게 적용한다."**

## 검증 대상 저장소 (현재 디렉터리 — 직접 읽어 대조하라)

`backend/src/main/java/com/room/backend/` 아래에 `api/`(42파일) `domain/`(45) `global/`(34) `feature/`(76)가 공존한다.
room operation 7개는 이미 `feature/` 아래 vertical slice로 이관됐다.
아래 두 패스의 **실측 주장을 네가 직접 파일로 확인하라.** 틀린 인용이 있으면 그것부터 지적하라.

결정된 규율:
- AD-2: feature는 `api → application → domain` 의존, domain은 web DTO를 import하지 않는다.
- AD-11: 재사용은 상속보다 capability contract와 composition.
- 추출은 consumers 2 이상 + 변경 주기가 같다는 증거가 있을 때만 (`.project-atlas/registry/reuse-candidates.yaml`).
- 잔여 legacy(address, auth, directions, map, report)는 제자리 유지.

평가 배경이 된 외부 템플릿은 `/Users/jonghoPro/woo/00_project/00_universe/template/java/`의
제네릭 CRUD 기반층 15파일이며, 앞선 codex 리뷰에서 MAJOR 14건으로 "표준 승격 불가" 판정을 받았다.

---

# 패스 A — 선별 판정 (Claude fable-5)

15파일 각각 KEEP/REWRITE/DROP을 판정하게 했다. 결론은 **15개 전부 DROP**이다.

선별 기준 5개: (K1) BangCheck `global/common`에 같은 역할이 이미 있으면 그쪽이 정본,
(K2) AD-2·AD-11 적합성, (K3) consumers 2 미만이면 추출 대상 아님,
(K4) 원본 패키지·업무어휘·인프라 의존이 박힌 것은 이식 불가, (K5) MAJOR 결함이 본체에 있으면 KEEP 불가.

주요 판정과 근거:
- `BaseController` DROP — 상속으로 매핑 7종 전파, 웹 계층이 엔티티를 직접 조회·매핑·저장(50–52행). AD-2 역방향 침범.
- `BaseService`/`BaseServiceImpl` DROP — 저장소 중계뿐. `search()`가 filters 무시, `convertFilters` 죽은 코드, 리플렉션 softDelete.
- `BaseRepository` DROP — 유일한 부가가치 `deleteByPublicKey`의 소비자가 0. BangCheck 전역 `publicKey` grep 0건.
- `BaseEntity` DROP — BangCheck `global/common/entity/BaseEntity.java`가 이미 더 낫다(setter 없음, `nullable=false`,
  soft delete가 리플렉션 아닌 도메인 메서드, consumers 6). `@EnableJpaAuditing`도 이미 켜져 있음.
- 응답 3종 DROP — `ApiResponse{success,code,message,data}`와 봉투가 다르고, BangCheck는
  `GeneralException` → `@RestControllerAdvice` 중앙 변환 + feature별 `BaseErrorCode` 구현체 체계다.
- S3Config/FileValidator/로깅 3종 DROP — S3·업로드·인터셉터·AOP 전부 grep 0건.

패스 A의 최종 주장: **"이 템플릿의 BangCheck 재사용 가치는 0이다.
겹치는 관심사는 전부 `global/common`이 이미 더 나은 구현을 소비자 실증과 함께 갖고 있고,
겹치지 않는 관심사(S3·업로드·publicKey)는 소비자가 없다."**
코드 대신 패턴 3건만 장부에 이름으로 남기라고 권고했다.

# 패스 B — Spring 권장 대안의 적용 설계 (Claude fable-5)

앞선 codex 리뷰가 권한 대안 7종을 우리 맥락에 판정하게 했다. 결론은
**"7개 중 4개는 이미 살아 있는 관례다. 신규 도입 0건, 조건부 대기 3건, 완전 기각 1건"**이다.

1. aggregate별 구체 repository — 채택(이미 있음). 단 **노출 통제 지점은 repository가 아니라 port**라고 주장.
   `feature/roomlist/application/port/RoomCatalog.java`가 `findActiveRoomsOf` 하나만 노출하고
   `JpaRepository` 전체 CRUD는 adapter 뒤에 숨는다는 실측.
2. 유스케이스별 `@Transactional` 경계 — 채택하되 **애노테이션 방식은 기각**.
   `feature/roomregistration/application/port/TransactionBoundary.java`가 이유를 명문화(final use case는 CGLIB 프록시 불가).
   두 변형 공존을 실측: A형(use case가 TransactionBoundary port를 잡음, roomregistration 1개) vs
   B형(store adapter가 `TransactionTemplate` 내부 소유, 4개). **B형을 표준으로 고정하고
   A형은 서로 다른 store 둘 이상을 한 트랜잭션으로 묶을 때만** 쓰자고 제안.
3. Request/Response/Summary 분리 — 채택(이미 있음). 단 codex가 권한
   `CreateXRequest/UpdateXRequest/XResponse/XSummary` **명명은 이식하지 않는다** —
   기존 Bean Validation 메시지가 응답 계약의 일부라 개명이 계약을 깬다고 주장.
4. MapStruct — **기각**. 매핑 대상이 record라 필드 변경 시 생성자 인자 불일치로 컴파일이 깨지므로
   컴파일 타임 검증을 이미 얻고 있다는 논리. 잔여 위험으로 "같은 타입 인접 필드 자리바꿈 무검출"을 명시.
5. Specification/QBE — **기각(트리거 대기)**. 동적 검색이 nullable 필터 1축뿐.
   트리거는 "한 조회 경로에 선택적 필터 축 3개 이상", 발동해도 adapter 안에서만 쓰고 port 시그니처는 불변.
6. `@RestControllerAdvice` 채택(이미 있음) / **`ProblemDetail` 기각** —
   전역 핸들러 + slice-local `@Order(HIGHEST_PRECEDENCE)` 이중 구조가 이미 있고
   `ApiResponse` 봉투가 contractTest로 고정된 라이브 계약이라 RFC 7807 전환은 파괴적이라는 논리.
7. 목록·상세 projection — DTO 분리는 이미 완료, **DB projection은 성능 실측 후**로 보류.

패스 B가 스스로 밝힌 검증 공백: **의존 방향(AD-2, port 규칙)을 검사하는 수단이 없다.**
ArchUnit류가 없어 리뷰로만 지켜진다며, 의존성 0인 grep 게이트를 대안으로 제시했다.

---

# 네가 할 일

1. **두 패스의 실측 인용을 직접 검증하라.** 파일·줄을 열어 대조하고, 틀린 인용·과장·누락을 지적하라.
   특히 다음을 확인하라 — `RoomCatalog` port의 실제 노출 범위, `TransactionBoundary`의 실존과 주석,
   A형/B형 트랜잭션 변형이 정말 4:1인지, `ApiResponse`와 slice-local advice 이중 구조,
   `global/common/entity/BaseEntity`가 정말 템플릿판보다 나은지.

2. **두 패스가 충돌하는 지점을 찾아 판정하라.** 겉으로는 안 부딪히지만 전제가 다를 수 있다.
   예컨대 A는 "재사용 가치 0"이라 하고 B는 "이미 관례가 있다"고 하는데,
   그 둘이 같은 말인지 다른 말인지, 그리고 둘 다 놓친 제3의 가능성이 있는지.

3. **둘 다 놓친 것을 찾아라.** 이것이 네 존재 이유다.
   특히 "Spring 권장을 우리에 맞게 적용한다"는 원래 목표에 비추어,
   두 패스가 아예 다루지 않은 Spring 표준 관행이 있는지.
   그리고 "신규 도입 0건"이라는 결론이 정말 옳은지 — 아무것도 안 바꾸는 것이 답인 경우는 드물다.

4. **B형 트랜잭션 표준화 제안을 특히 공격하라.**
   store adapter가 `TransactionTemplate`을 내부 소유하는 방식이 정말 표준으로 삼을 만한가.
   Spring 공식 권장과 대조하고, 이 방식이 언제 깨지는지 구체적 시나리오를 대라.

5. **최종 명세를 내라.** 다음 형식으로.
   - 확정 사항 (지금 바로 규칙으로 굳힐 것)
   - 조건부 대기 (트리거와 함께)
   - 만들어야 할 것 (검증 공백을 메우는 것 — 있다면)
   - 명시적 기각 (사유와 재심 조건)

# 형식

각 지적에 severity(MAJOR/MINOR)를 붙이고 근거 파일·줄을 명시하라.
실측(파일에서 읽은 것)과 추론(일반 지식)을 반드시 구분해 표기하라.
두 패스에 동의하는 부분은 짧게, 반박하는 부분은 길게 써라.
마지막에 "이 명세대로 가면 6개월 뒤 무엇이 문제가 되는가"를 한 문단으로 적어라.

```

## Final response

```text
결론부터 말하면, 패스 A의 “15개 전부 DROP”은 맞습니다. 다만 “재사용 가치 0”은 “소스 코드 이식 가치 0”으로 한정해야 합니다. 패스 B의 “신규 도입 0건”과 “store adapter 내부 `TransactionTemplate`을 표준화”는 기각해야 합니다.

최종 명세는 신규 공통 CRUD 기반층을 만들지 않고, 트랜잭션 경계를 application/use-case로 올리며, ArchUnit 기반 의존성 검사를 즉시 추가하는 것입니다.

## 1. 실측 인용 검증

### 패스 A

- **[MAJOR][실측: 확인] `BaseController` DROP**

  7개 route mapping을 상속으로 전파하며, update에서 controller가 엔티티를 직접 조회·변경·저장합니다. [BaseController.java:33](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/controller/BaseController.java:33>), [BaseController.java:48](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/controller/BaseController.java:48>).

  AD-2와 현재 operation별 slice 구조에 부적합합니다.

- **[MAJOR][실측: 확인·누락 보강] `BaseServiceImpl` DROP**

  `search()`가 filters를 무시하고 [BaseServiceImpl.java:53](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/service/BaseServiceImpl.java:53>), `convertFilters()`는 호출되지 않습니다. 더 심각하게 reflection은 `isDelete` 필드를 찾는데 [BaseServiceImpl.java:63](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/service/BaseServiceImpl.java:63>), 템플릿 `BaseEntity` 자체에도 그 필드가 없습니다. 즉 soft delete는 BangCheck 이식 전부터 자기 템플릿 안에서도 성립하지 않습니다.

- **[MINOR][실측: 확인] `BaseRepository` DROP**

  추가 기능은 `deleteByPublicKey` 하나뿐입니다. [BaseRepository.java:11](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/repository/BaseRepository.java:11>). BangCheck main/test/contractTest에서 `publicKey` 소비자는 0입니다. 템플릿 내부 호출자를 제외하면 실제 이식 수요가 없습니다.

- **[MAJOR][실측: 확인] 현행 `BaseEntity`가 현재 저장소에는 더 적합**

  현행은 setter가 없고, protected 생성자, `nullable=false`, 명시적 `softDelete/restore`를 가집니다. [BaseEntity.java:15](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/common/entity/BaseEntity.java:15). 6개 엔티티가 상속하며 auditing도 활성화돼 있습니다. [BackendApplication.java:18](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/BackendApplication.java:18).

  반대로 템플릿은 public setter·builder·all-args constructor를 열고 audit 컬럼의 null 제약도 없습니다. [템플릿 BaseEntity.java:14](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/domain/BaseEntity.java:14>). 따라서 “모든 프로젝트에 보편적으로 더 낫다”가 아니라 “BangCheck 요구와 실제 소비자 기준으로 더 낫다”가 정확합니다.

- **[MAJOR][실측: 확인] 응답 3종 DROP**

  현행 봉투는 `success/code/message/data`입니다. [ApiResponse.java:10](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/common/response/ApiResponse.java:10). `GeneralException`은 중앙 advice에서 `BaseErrorCode`의 status/code/message로 변환됩니다. [GlobalExceptionHandler.java:20](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/common/exception/GlobalExceptionHandler.java:20), [BaseErrorCode.java:5](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/common/exception/BaseErrorCode.java:5).

  템플릿 `BaseResponse`는 다른 필드 구조이고 PDF 전송까지 한 타입에 섞었습니다. [BaseResponse.java:20](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/response/BaseResponse.java:20>), [BaseResponse.java:127](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/response/BaseResponse.java:127>).

- **[MAJOR][실측: 확인·누락 보강] 인프라 5종 DROP**

  BangCheck에는 S3 client, multipart upload, interceptor, AOP, `AuditorAware` 소비자가 없습니다. 원본에도 별도 결함이 있습니다.

  - logging aspect pointcut가 템플릿 패키지 `com.dev.woo`가 아닌 `com.dev.millionhands`를 가리킵니다. [LayerLoggingAspect.java:14](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/logging/LayerLoggingAspect.java:14>).
  - interceptor는 `WebMvcConfigurer` 등록이 없어 `@Component`만으로 작동하지 않습니다. [loggingInterceptor.java:11](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/logging/loggingInterceptor.java:11>).
  - auditor는 모든 변경자를 `"adminUser"`로 기록합니다. [AuditorAwareImpl.java:8](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/util/audit/AuditorAwareImpl.java:8>).
  - S3는 static access key 방식입니다. [S3Config.java:20](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/config/S3Config.java:20>).
  - FileValidator는 클라이언트가 제시한 확장자와 MIME만 신뢰합니다. [FileValidator.java:94](</Users/jonghoPro/woo/00_project/00_universe/template/java/core/util/FileValidator.java:94>).

- **[MINOR][실측: 패스 A 과장] “겹치는 관심사는 전부 `global/common`에 있다”는 부정확**

  `BaseEntity`와 응답/오류는 실제로 겹치지만 generic controller/service/repository, logging, upload는 `global/common`에 대체 구현이 있는 것이 아닙니다. 이들은 “중복이라서”가 아니라 AD-2/AD-11 부적합, 소비자 0, 원본 결함 때문에 DROP입니다.

### 패스 B

- **[MAJOR][실측: 확인] `RoomCatalog`의 실제 노출 범위**

  port는 정확히 `findActiveRoomsOf(ownerId, rentType)` 한 메서드만 노출합니다. [RoomCatalog.java:11](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomlist/application/port/RoomCatalog.java:11). 실제 `JpaRepository`는 adapter 뒤에 있습니다. [JpaRoomCatalog.java:17](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomlist/adapter/persistence/JpaRoomCatalog.java:17).

  “노출 통제는 repository가 아니라 use-case-shaped port에서 한다”는 B의 결론은 맞습니다.

- **[MAJOR][실측: 확인] `TransactionBoundary` 실존과 주석**

  interface와 두 가지 사유가 실제로 있습니다. [TransactionBoundary.java:5](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomregistration/application/port/TransactionBoundary.java:5). CGLIB가 final class를 proxy할 수 없다는 설명 자체도 Spring 공식 동작과 맞습니다. [Spring AOP proxy 공식 문서](https://docs.spring.io/spring-framework/reference/6.2/core/aop/proxying.html).

  다만 final 유지가 확정된 아키텍처 불변식은 아닙니다. 스스로 만든 제약을 이유로 Spring의 기본 방식을 전면 기각한 것입니다.

- **[MAJOR][실측: 수량만 확인] A형:B형은 문법적으로 1:4**

  A형은 roomregistration 1개입니다. [RegisterRoomWithChecklist.java:23](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomregistration/application/RegisterRoomWithChecklist.java:23).

  B형은 다음 4개 adapter가 `TransactionTemplate`을 직접 보유합니다.

  - [JpaAnswerSubmissionStore.java:10](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomanswersave/adapter/persistence/JpaAnswerSubmissionStore.java:10)
  - [JpaBasicRoomStore.java:15](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomcreate/adapter/persistence/JpaBasicRoomStore.java:15)
  - [JpaRoomDeletionStore.java:7](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomdelete/adapter/persistence/JpaRoomDeletionStore.java:7)
  - [JpaRoomUpdateStore.java:14](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomupdate/adapter/persistence/JpaRoomUpdateStore.java:14)

  그러나 이 4:1은 “패턴의 우월성” 증거가 아니라 현재 구현 모양의 개수일 뿐입니다.

- **[MAJOR][실측: B의 분류 반례] update는 이미 둘 이상의 저장 기능을 묶음**

  `JpaRoomUpdateStore`는 `RoomRepository`, geocoding, `ChecklistAnswerPersistence`를 한 transaction에서 조정합니다. [JpaRoomUpdateStore.java:14](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomupdate/adapter/persistence/JpaRoomUpdateStore.java:14).

  따라서 “서로 다른 store 둘 이상이면 A형”이라는 B의 트리거는 adapter 내부 협력자를 port 하나로 감추는 순간 무력화됩니다. 경계 선택이 실제 unit of work가 아니라 인터페이스 개수에 좌우됩니다.

- **[MAJOR][실측: 확인하되 과장 수정] ApiResponse + 이중 advice**

  중앙 advice와 roomregistration 예외 advice가 공존합니다. [GlobalExceptionHandler.java:20](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/common/exception/GlobalExceptionHandler.java:20), [RoomRegistrationExceptionHandler.java:27](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomregistration/adapter/web/RoomRegistrationExceptionHandler.java:27).

  하지만 후자는 package만 slice-local일 뿐, `@RestControllerAdvice`에 controller 범위 제한이 없어 Spring MVC 전체에 적용됩니다. 또한 API 전체가 단일 `ApiResponse` 계약인 것도 아닙니다. report 성공 응답은 봉투가 없고 [ReportContractTest.java:96](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/contractTest/java/com/room/backend/api/report/ReportContractTest.java:96), security entry point는 직접 JSON을 씁니다. [SecurityConfig.java:77](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/config/SecurityConfig.java:77).

  `ProblemDetail` 기각 결론은 맞지만 “하나의 균일한 봉투가 고정됐다”가 아니라 “서로 다른 v1 응답 형태들이 이미 계약 테스트로 고정됐다”가 정확합니다. 현재 Spring 표준은 RFC 7807이 아니라 RFC 9457입니다. [Spring MVC Error Responses](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html).

- **[MAJOR][추론: B의 MapStruct 논거 오류] record 생성자는 매핑 검증과 동치가 아님**

  `RoomRegistrationResponse`는 동일 타입 필드가 연속된 23항 생성자입니다. [RoomRegistrationResponse.java:20](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomregistration/adapter/web/RoomRegistrationResponse.java:20). record는 인자 수나 타입 변경은 잡지만 `lat/lon`, 여러 `Boolean`, 여러 `Integer`의 자리바꿈은 잡지 못합니다.

  MapStruct는 unmapped target을 build error로 승격할 수 있으므로 B의 “이미 같은 검증을 얻는다”는 틀렸습니다. [MapStruct 공식 설정](https://mapstruct.org/documentation/stable/reference/html/index.html). 그렇다고 지금 즉시 MapStruct가 필요하다는 뜻은 아닙니다.

- **[MINOR][실측·추론: DTO 명명 기각 사유 오류]**

  Validation 메시지는 타입명이 아니라 필드 애노테이션에 선언돼 있습니다. [RoomCreateRequestDTO.java:15](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/api/room/dto/request/RoomCreateRequestDTO.java:15). Java 클래스명 변경만으로 해당 메시지가 바뀌지는 않습니다.

  기존 이름을 유지할 이유는 개명 편익이 없고 OpenAPI schema/source compatibility drift 가능성이 있기 때문입니다. 결론은 유지하되 논거를 교체해야 합니다.

- **[MAJOR][실측: 검증 공백 확인]**

  dependency block에 ArchUnit이나 Spring Modulith가 없습니다. [build.gradle:48](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/build.gradle:48). B가 인정한 공백은 사실입니다.

- **[MINOR][실측: 파일 수 보정]**

  Java 파일 기준 `api 42 / domain 45 / global 34 / feature 76`은 맞습니다. 다만 `global` 아래에 동일한 Flyway V13 파일 복제본이 하나 더 있어 전체 파일은 35개입니다. [잘못 놓인 V13:1](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/global/common/exception/V13__add_room_fields.sql:1). 정본은 `src/main/resources/db/migration`에 있으며 두 파일의 checksum도 동일합니다.

## 2. 두 패스의 충돌 판정

- **[MINOR][추론] 직접 충돌은 아님**

  A는 외부 템플릿의 소스 이식 가치를 평가했고, B는 Spring 패턴이 현재 코드에 이미 구현됐는지를 평가했습니다. 현재의 좁은 port나 DTO 분리는 외부 템플릿을 재사용한 것이 아니므로 두 주장은 동시에 참일 수 있습니다.

- **[MAJOR][추론] 둘 다 놓친 제3의 경로**

  선택지는 “템플릿 복사”와 “아무것도 안 함” 둘뿐이 아닙니다. 실제 정답은 다음입니다.

  1. 외부 generic 기반층은 복사하지 않는다.
  2. 이미 드러난 좋은 관례를 architecture test로 강제한다.
  3. 잘못 자리 잡은 transaction 경계를 application unit of work로 옮긴다.
  4. 신규 라이브러리는 결함이나 측정 트리거가 있을 때만 추가한다.

  따라서 A의 DROP과 B의 일부 현행 유지 사이에 “규율을 실행 가능한 검증으로 만들고 잘못된 현행 패턴은 교정한다”는 경로가 빠졌습니다.

## 3. B형 트랜잭션 표준화 판정

- **[MAJOR][공식 근거] Spring 기본 권장과 반대**

  Spring은 대다수 애플리케이션에 선언적 트랜잭션을 선택한다고 명시합니다. [Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html). Programmatic 방식을 택한다면 `TransactionTemplate`이 맞지만, 공식 예시는 여러 작업을 묶는 service가 template을 소유합니다. [Programmatic Transaction Management](https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/programmatic.html).

  Spring Data JPA도 여러 repository를 묶는 service/facade에 경계를 두고, unit of work 시작점에서 transaction을 선언하라고 권고합니다. [Spring Data JPA Transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html).

- **[MAJOR][실측] B형은 application logic을 adapter 안으로 밀어 넣음**

  `CreateRoom`은 한 줄 위임뿐이고 [CreateRoom.java:8](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomcreate/application/CreateRoom.java:8), 실제 상한 검사·외부 geocoding·저장은 `JpaBasicRoomStore`에 있습니다. [JpaBasicRoomStore.java:22](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomcreate/adapter/persistence/JpaBasicRoomStore.java:22). persistence adapter가 사실상 use case가 된 상태입니다.

- **[MAJOR][추론] 구체적인 파손 시나리오**

  - delete 후 audit/outbox 저장이 추가되면 delete adapter가 먼저 commit하고 audit 실패를 함께 rollback할 수 없습니다.
  - answer 저장 전에 소유권 검사를 추가하면 검사와 저장이 서로 다른 transaction이 되어 TOCTOU가 생깁니다.
  - update adapter 뒤에 두 번째 port 호출이 추가되면 첫 store transaction만 commit한 뒤 두 번째 작업이 실패할 수 있습니다.
  - create/update는 DB 조회 후 외부 geocoding을 transaction 내부에서 호출합니다. provider 지연 동안 DB transaction/connection을 오래 점유합니다.
  - 활성 방이 5개일 때 동시 create 두 건이 모두 count=5를 보고 저장하면 7개가 될 수 있습니다. 현재 transaction은 이 invariant를 직렬화하거나 DB 제약으로 보장하지 않습니다.

- **[MAJOR][실측] 읽기 transaction도 빠짐**

  `ListMyRooms`는 room 목록 조회 후 방마다 여러 repository를 호출하면서, read-only transaction은 dirty checking 최적화일 뿐 결과는 같다고 주장합니다. [ListMyRooms.java:20](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomlist/application/ListMyRooms.java:20), [JpaRoomIssueLookup.java:50](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/main/java/com/room/backend/feature/roomlist/adapter/persistence/JpaRoomIssueLookup.java:50).

  이것은 동시성에서는 틀립니다. 한 요청이 방 목록과 문제 badge를 서로 다른 DB snapshot에서 읽을 수 있습니다. Spring Data도 declared query method에는 기본 transaction이 없고 unit-of-work 경계를 권고합니다.

- **[MAJOR][실측] 4개 B형을 표준화할 검증 증거가 없음**

  transaction rollback을 실제 MySQL에서 확인하는 테스트는 주로 roomregistration 경로뿐입니다. [RoomCreateWithChecklistContractTest.java:270](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/backend/src/contractTest/java/com/room/backend/api/room/RoomCreateWithChecklistContractTest.java:270). basic create/update/delete 네 경로의 독립 rollback·부분 commit 방지 테스트는 없습니다.

## 4. 최종 명세

### 확정 사항

- **[MAJOR] 외부 템플릿 15개는 전부 DROP한다.** 소스·상위 타입·패키지를 복사하지 않는다.
- **[MAJOR] transaction의 소유자는 persistence adapter가 아니라 application use case/unit of work다.**
- **[MAJOR] 기본 방식은 proxy 가능한 application bean의 public use-case method에 선언적 `@Transactional`을 적용한다.** 현재 `final`은 확정 불변식이 아니므로 필요한 application class만 non-final로 만든다. domain은 계속 Spring-free로 둔다.
- **[MAJOR] 여러 쿼리로 하나의 결과를 조립하는 읽기 use case는 `@Transactional(readOnly = true)`를 기본으로 한다.**
- **[MAJOR] concrete Spring Data repository는 adapter 뒤에 숨기고, application에는 use-case-shaped port만 노출한다.**
- **[MAJOR] domain은 web DTO, Spring MVC, persistence adapter를 import하지 않는다.**
- **[MINOR] 기존 v1의 `ApiResponse`·security direct response·bare report response는 계약 테스트가 보호하는 현행 계약으로 유지한다.**
- **[MINOR] 현재 `global/common/entity/BaseEntity`를 정본으로 유지한다. generic entity hierarchy는 추가하지 않는다.**
- **[MINOR] 재사용 추출은 기존 기준대로 consumers 2 이상과 동일한 변경 주기 증거가 있을 때만 한다.**

### 조건부 대기

- **[MINOR] MapStruct:** 신규 대형 mapper 추가, 실제 mapping defect 발생, 또는 필드 rename이 반복될 때 재심한다. 도입 시 `unmappedTargetPolicy=ERROR`가 필수다.
- **[MINOR] Specification/QBE:** 같은 조회 경로에 선택적 predicate 3축 이상이 생기거나 조합별 query method 중복이 발생할 때 adapter 내부에만 도입한다. port 시그니처에는 Spring Data 타입을 노출하지 않는다. [Spring Data Specifications](https://docs.spring.io/spring-data/jpa/reference/jpa/specifications.html).
- **[MINOR] DB projection:** query-count/latency/heap 측정에서 entity over-fetch가 병목으로 확인될 때만 도입한다. 현재 목록의 우선 병목 후보는 projection보다 `JpaRoomIssueLookup`의 N+1입니다. [Spring Data Projections](https://docs.spring.io/spring-data/jpa/reference/repositories/projections.html).
- **[MINOR] ProblemDetail:** API v2 또는 versioned media type에서만 RFC 9457 전환을 재심한다. v1 응답 형태를 제자리에서 교체하지 않는다.
- **[MINOR] Spring Modulith:** 잔여 legacy가 줄고 각 feature를 명시적 application module로 선언할 수 있을 때 재심한다. 현재 기본 탐지는 `api/domain/global/feature`만 최상위 module로 볼 가능성이 있어 7개 slice 경계와 맞지 않습니다. Modulith 자체는 cycle과 internal package 접근을 검증할 수 있습니다. [Spring Modulith verification](https://docs.spring.io/spring-modulith/reference/verification.html).
- **[MINOR] Actuator/Micrometer:** health check, SLO, metrics backend가 운영 요구로 확정될 때 템플릿 logging AOP 대신 도입한다. [Spring Boot Metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html).

### 만들어야 할 것

- **[MAJOR] ArchUnit architecture fitness test**

  grep gate 대신 test dependency로 추가해 일반 `test` task에서 실행합니다. 최소 규칙은 다음과 같습니다.

  - `feature..domain` → adapter/web/api/Spring/JPA 의존 금지
  - `feature..application` → adapter 의존 금지
  - application port → `JpaRepository`, EntityManager, Spring MVC 타입 노출 금지
  - adapter → application/domain 방향만 허용
  - 다른 feature의 internal package 접근 금지, `feature.shared`만 allowlist
  - feature slice 간 cycle 금지

  ArchUnit은 package layer와 slice cycle을 직접 검사합니다. [ArchUnit 공식 가이드](https://www.archunit.org/userguide/html/000_Index.html).

- **[MAJOR] transaction normalization**

  4개 store adapter에서 `TransactionTemplate` 소유를 제거하고 create/update/delete/answer-save use case 경계로 올립니다. roomregistration도 특별한 programmatic 제어가 없다면 선언적 경계로 통일합니다.

  동적 isolation/propagation, 수동 `setRollbackOnly`, 여러 transaction chunk처럼 programmatic 제어가 입증될 때만 `TransactionTemplate`을 사용하고, 그때도 application orchestration에 둡니다.

- **[MAJOR] transaction contract tests**

  basic create/update/delete/answer-save 각각에 다음을 추가합니다.

  - 두 번째 DB 작업 실패 시 첫 작업도 rollback
  - adapter 뒤에 두 번째 port가 추가돼도 부분 commit 없음
  - checked/unchecked 예외 rollback 정책
  - read use case의 일관된 snapshot
  - 동시 room create에서 6개 상한 보장 방식

- **[MAJOR] mapper 검증 보강**

  `RoomCreateDataMapper`, `RoomUpdateDataMapper`, `RoomMutationResponse`의 모든 필드를 검사하는 테스트가 필요합니다. 현재 record의 컴파일 성공만으로 의미적 매핑은 보장되지 않습니다.

- **[MINOR] 소스 트리 위생 정리**

  Java source 아래의 V13 SQL 복제본은 제거 대상으로 등록하고 Flyway 정본은 `src/main/resources/db/migration` 하나만 유지합니다.

### 명시적 기각

- **[MAJOR] generic `BaseController/BaseService/BaseRepository` 및 상속 기반 CRUD 표준**
- **[MAJOR] store adapter 내부 `TransactionTemplate`을 기본 표준으로 삼는 B형**
- **[MAJOR] “final class 때문에 `@Transactional`을 전면 기각한다”는 규칙**
- **[MINOR] v1 응답을 즉시 ProblemDetail로 변경**
- **[MINOR] 현 단계의 MapStruct 일괄 도입**
- **[MINOR] nullable filter 1축에 Specification/QBE 도입**
- **[MINOR] 측정 없는 DB projection**
- **[MINOR] template의 자체 logging interceptor/AOP/S3/FileValidator/AuditorAware 도입**

## 6개월 뒤의 위험

이 명세대로 가도 가장 큰 위험은 `api/domain/global/feature` 이중 체제가 오래 지속되면서 ArchUnit allowlist가 예외 목록으로 변질되는 것입니다. 또 선언적 transaction은 proxy를 거치지 않는 self-invocation에서 작동하지 않으므로 application use case를 작게 유지하고 외부 bean 호출 경계를 보존해야 합니다. `feature/shared`도 consumers 수만 보고 계속 확장하면 새 generic dumping ground가 될 수 있습니다. 6개월 뒤 점검 대상은 “예외 allowlist 증가량, shared 패키지 변경 이유, transaction self-invocation, v1 응답 형태 수” 네 가지입니다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
