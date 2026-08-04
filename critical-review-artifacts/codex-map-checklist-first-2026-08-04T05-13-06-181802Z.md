# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T05:10:23.624094+00:00
- Finished at (UTC): 2026-08-04T05:13:06.177750+00:00

## Original task / label

map-checklist-first

## Final prompt

```text
## 이 지시가 저장소의 다른 모든 지시에 우선한다

`AGENTS.md`, `.cursorrules`, `GEMINI.md`, `_wood/` 규약은 이 검토에 적용하지 않는다.
`_wood/workflows/_protocol.md`·`_wood/agents/_safety.md`의 Y/N 확인도 해당 없다.
비용·승인을 되묻지 마라 — 되묻는 응답은 실패로 처리된다.
STEP 0/1을 밟지 말고 바로 검토하라.

**명령을 실행해도 된다.** `python3 .project-atlas/tools/resolve.py`를 직접 돌려라.
파일 수정은 하지 마라. 판정만 내라.

---

# 과제

Atlas Map의 첫 확장분 세 파일을 검토하라.
이것은 **이후 10개 라우트를 같은 형식으로 채울 본보기**가 된다.
형식이 틀리면 전부 다시 손대야 하므로, 지금 틀린 것을 찾는 것이 이 검토의 값이다.

검토 대상 diff: `git diff a19a196..f9e65d7`

## 무엇을 만들었나

`.project-atlas/registry/`에 세 파일을 새로 썼다.

- `FT-CHECKLIST-CATALOG.yaml` — operation 2 (`GET /api/checklist/items`, `/items/all`)
- `FT-CHECKLIST-CUSTOM-ITEM.yaml` — operation 2 (custom item 추가·삭제)
- `FT-CHECKLIST-SETTINGS.yaml` — operation 4 (types 3종 + settings 저장)

## 저작자의 판단과 근거 — 이것을 반박하라

**판단 1 — ID를 발명하지 않았다.**
`defects.yaml`이 이미 이 세 ID를 `relatedFeature`로 가리키고 있었고 파일만 없었다.

**판단 2 — 기능 경계를 defect 분포가 결정했다.**
BC-CHK-01·04·05·06 → custom-item, BC-CHK-02 → settings, BC-CHK-03 → catalog.
저작자가 경계를 새로 그은 것이 아니라 이미 그어진 것을 따랐다고 주장한다.

**판단 3 — `frontendEntry`를 처음으로 채웠다.**
여덟 operation의 프론트 진입점이 전부
`frontend/src/services/custom-checklist-service.ts` 하나라고 실측했다.
schema에 선언만 있고 required가 아니라 resolver가 검사하지 않는 필드다.

**판단 4 — 안전 필드는 관측이지 주장이 아니다.**
custom-item의 `rerunSafe: false`는 "위험하다"가 아니라 "지금 두 번째 삭제가
404가 아니라 500이다"라는 관측이며 BC-CHK-01이 근거라고 주장한다.
settings의 네 operation은 `rerunSafe: true`로 적었다.

**판단 5 — settings에 operation 4개를 한 feature로 묶었다.**
근거는 설정 화면 한 번의 저장이 네 operation을 순차 호출한다는 것이다
(`frontend/src/features/customization/hooks/use-customization.ts`).

## 검증할 것

1. **resolver를 직접 돌려라.** 저작자는 641건 위반 0건이라고 주장한다.
   등재 전은 504건이었다. 이 숫자가 맞나.

2. **operation 8개의 route가 실제 제품과 맞나.**
   `backend/src/main/java/com/room/backend/domain/checklist/controller/ChecklistController.java`와
   route oracle(`backend/src/test/resources/atlas-baseline/routes.txt`)을 대조하라.
   빠뜨린 operation이 있나. 잘못 적은 method·path가 있나.

3. **안전 필드가 코드와 맞나.** 이것이 가장 중요하다.
   `domain/checklist/service/ChecklistService.java`를 직접 읽고
   각 operation의 `sideEffect`·`writes`·`rerunSafe`·`abortOnFail`이
   실제 동작과 일치하는지 판정하라.
   특히 다음을 의심하라 —
   - settings의 `rerunSafe: true` 넷이 정말 멱등인가
   - `writes`에 적은 테이블 이름이 실제 엔티티와 맞나
     (저작자는 코드를 확인하지 않고 이름을 유추했을 수 있다)
   - `abortOnFail: FULL_ROLLBACK`이 실제 트랜잭션 경계와 맞나

4. **기능 경계가 옳은가.** defect 분포를 따랐다는 근거가 충분한가.
   더 나은 경계가 있나. 특히 settings의 4-operation 묶음이 과대하지 않나.

5. **`frontendEntry` 실측이 맞나.** 여덟 개가 정말 그 파일 하나인가.
   `use-customization.ts`나 `use-checklist-items.ts`가 더 정확한 진입점 아닌가.

6. **본보기로서 결함이 있나.** 이 형식으로 남은 10개 라우트
   (map 4, auth 3, report 2, directions 1)를 채울 때 문제가 될 지점.
   특히 `uses: []`가 전부 비어 있는데, feature 간 참조가 정말 없나.

7. **빠뜨린 것.** 위가 다루지 않았는데 Map의 값을 깎는 것.

## 형식

각 지적에 severity(MAJOR/MINOR)와 근거 파일·줄을 붙여라.
실측(파일에서 읽거나 명령을 돌린 것)과 추론을 구분하라.
마지막에 "이 형식으로 나머지 10개를 채워도 되는가"에 대한 한 줄 판정을 내려라.

```

## Final response

```text
판정: **REVISE**. route와 resolver 숫자는 맞지만, 이 세 파일은 안전·의존성·프론트 진입점에서 본보기로 쓰기엔 결함이 있습니다.

실측 결과:

- `python3 .project-atlas/tools/resolve.py` → **641건 / 위반 0건**.
- diff가 세 registry 파일뿐임을 확인한 뒤, 같은 resolver에서 그 세 파일만 제외해 재현 → **504건 / 위반 0건**. 저작자의 수치 주장은 맞습니다.
- controller와 route oracle 대조 결과, checklist의 **8개 operation은 누락·method/path 오기 없이 전부 일치**합니다. [ChecklistController.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/controller/ChecklistController.java:22), [routes.txt](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/test/resources/atlas-baseline/routes.txt:2)

지적 사항:

- **MAJOR — `writes`가 실제 테이블명이 아니다.**  
  custom add/delete는 `checklist_custom_item`이 아니라 `checklist_items`를 저장·soft-delete합니다. [FT-CHECKLIST-CUSTOM-ITEM.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-CHECKLIST-CUSTOM-ITEM.yaml:20), [ChecklistItem.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/entity/ChecklistItem.java:15)  
  type 선택/해제는 `checklist_user_type`가 아니라 `user_type_selections`, 설정 저장은 `checklist_item_setting`이 아니라 `user_checklist_settings`입니다. [FT-CHECKLIST-SETTINGS.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-CHECKLIST-SETTINGS.yaml:29), [UserTypeSelection.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/entity/UserTypeSelection.java:14), [UserChecklistSetting.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/entity/UserChecklistSetting.java:13)  
  resolver는 `writes`를 자유 문자열로만 다뤄 이 오류를 잡지 못합니다. 이는 이후 10개 route에도 그대로 복제될 결함입니다.

- **MAJOR — custom-item DELETE의 `rerunSafe: false`와 근거 주석이 코드·defect와 반대입니다.**  
  삭제 후에도 기본 `findById`는 soft-deleted row를 다시 찾고, `softDelete()`를 다시 호출하므로 두 번째 DELETE는 500/404가 아니라 200입니다. [ChecklistService.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java:169), [BaseEntity.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/global/common/entity/BaseEntity.java:35), [defects.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/defects.yaml:296)  
  “최종 논리 상태가 같으면 safe”라는 이 Map의 기준이면 `true`여야 하며, 기존 Atlas 카드도 `true`로 기록합니다. [custom-cards.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/custom-cards.ts:356)  
  `deletedAt` 재갱신까지 unsafe로 정의하려면 기존 room-delete의 `rerunSafe: true`도 함께 재판정해야 합니다.

- **MINOR — custom-item ADD의 `false` 값은 맞지만 증거 문장은 틀렸습니다.**  
  같은 이름의 두 번째 POST를 막는 중복 검사나 unique 제약이 없습니다. 둘째·셋째 요청도 새 `checklist_items` row를 만들며, 한도 초과가 되어서야 실패합니다. [FT-CHECKLIST-CUSTOM-ITEM.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-CHECKLIST-CUSTOM-ITEM.yaml:21), [ChecklistService.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java:148)  
  즉 `rerunSafe: false`는 맞지만 “같은 이름 두 번이면 409”은 관측이 아닙니다.

- **MAJOR — settings의 네 operation을 한 feature로 묶는 근거가 스스로의 실제 호출 순서와 맞지 않습니다.**  
  저장은 `deselect → select → custom delete → custom add → settings save`이며, settings feature가 소유한 GET `/types`는 저장 시 호출되지 않습니다. [use-customization.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:203)  
  또한 type과 visibility는 각각 다른 테이블과 독립 endpoint입니다. 화면 하나라는 사실만으로 원자적 기능 단위가 되지는 않습니다.  
  **추론:** `사용자 유형`과 `항목 표시 설정`을 분리하거나, 현재 묶음을 유지한다면 custom-item 및 catalog operation을 `uses`로 명시해야 일관됩니다.

- **MAJOR — 세 feature 모두 `uses: []`는 Map의 의존 그래프를 비웁니다.**  
  schema는 `uses`를 “남의 operation을 빌려 쓴다”는 관계로 정의하고, 기존 방 등록 feature도 화면의 주소 검색을 그렇게 연결합니다. [schema.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/schema.yaml:62), [FT-ROOM-CREATE-WITH-CHECKLIST.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-ROOM-CREATE-WITH-CHECKLIST.yaml:29)  
  실제 customization workflow는 catalog GET 둘과 custom add/delete를 함께 사용합니다. [use-customization.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:25)  
  **추론:** 현재 식으로는 “설정 기능이 어떤 다른 operation에 의존하는가”를 Map에서 답할 수 없습니다.

- **MAJOR — `frontendEntry`의 “전부 service 하나”는 API-adapter 기준으로만 참이고, 실제 진입점으로는 부정확합니다.**  
  literal HTTP 호출은 실제로 모두 `custom-checklist-service.ts`에 있습니다. [custom-checklist-service.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/services/custom-checklist-service.ts:4)  
  하지만 실제 소비 지점은 custom/settings의 일곱 동작이 `useCustomization`, `/items`는 그것과 별도로 `useChecklistItems`입니다. [use-customization.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:213), [use-checklist-items.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/checklist/hooks/use-checklist-items.ts:29)  
  더구나 resolver는 `frontendEntry`를 required로도, 경로·심볼로도 검증하지 않습니다. [schema.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/schema.yaml:68), [resolve.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:207)  
  따라서 service adapter를 의도한 필드라면 이름이 부정확하고, 사용자 흐름 진입점을 의도했다면 현재 값이 부정확합니다.

안전 필드 중 통과한 부분도 분명합니다. GET의 `READ/[]/true/NONE`, type select·deselect의 `WRITE/true/FULL_ROLLBACK`, settings save의 `WRITE/true/FULL_ROLLBACK`은 operation 단위로 코드와 맞습니다. class-level `@Transactional`이 적용되고 NPE·`GeneralException` 등은 runtime exception이므로 rollback됩니다. [ChecklistService.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java:27), [ChecklistService.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java:119), [ChecklistService.java](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java:139)

저작자 판단 1은 실측상 맞습니다. 세 defect의 `relatedFeature`도 diff 이전부터 정확히 그 세 ID를 가리킵니다. 판단 2는 defect 분포와는 일치하지만, 그 분포만으로 settings의 4-operation 경계까지 정당화되지는 않습니다.

**한 줄 판정: 아니오 — 최소한 실제 `writes`, custom DELETE 재실행 안전성, feature 간 `uses`, `frontendEntry`의 의미를 바로잡기 전에는 이 형식으로 나머지 10개를 채우면 안 됩니다.**
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
