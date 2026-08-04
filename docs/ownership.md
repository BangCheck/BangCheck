# 담당자 배정 (2026-08-04)

> **쉽게**: 각 기능을 누가 만들었고 문제가 나면 누구에게 물어야 하는지 적어 둔 표.
> 언제 보나: 이슈를 올리며 배정할 때, 또는 "이건 누구 코드였지"를 찾을 때.

## 기준 — 영역별 원저자

`owner`는 **그 코드를 실제로 쓴 사람**이다. 지금 고칠 사람이 아니다.
git author를 실측해 `_wood/team-roles.yaml`의 GitHub 로그인으로 옮겼다.

추측하지 않았다. 각 feature의 `implementedBy.slice` 경로에 대해
`git log --format=%an`을 세어 최다 저자를 골랐다.

## 배정

| 담당 | feature | 영역 |
|---|---|---|
| `@minwoo-l` | 10 | room 7 · map 2 · address 1 |
| `@dlwldP` | 3 | auth 3 |
| `@std-yong` | 3 | checklist 3 |
| `@hajimeong` | 2 | report 2 |
| `@Woo-JongHo` | 1 | directions |

`_wood/team-roles.yaml` 기준 실명은 각각
Lee Min-Woo · Lee Ji-Ye · Lee Jin-Yong · Ha Ji-Myeong · Woo Jong-Ho다.

## 반드시 함께 읽어야 할 한계

**이 배정으로 이슈를 바로 던지면 안 된다.**

팀 작업은 2026-05에 멈췄다. 실측하면 이렇다.

```
backend/api      마지막 커밋  Minwoo-lee-lee732   2026-05-27
backend/domain   마지막 커밋  Lee Jinyong         2026-05-29
frontend         마지막 커밋  Woo-JongHo          2026-08-04
```

즉 `@Woo-JongHo`를 뺀 넷은 **3개월 이상 이 저장소를 만지지 않았다.**
`_wood/workspace/`의 멤버별 작업 기록도 2026-04~05에서 멈춰 있다.

그래서 `owner`는 **이력이자 문의처**이지 처리 책임자가 아니다.
실제로 고칠 사람을 정하는 것은 별개 결정이며, 지금 그 사람은
사실상 `@Woo-JongHo` 하나다.

**연락이 닿는지 확인하지 않았다.** 이메일은 `team-roles.yaml`에 있으나
유효성을 검증한 적이 없다.

## 이 표를 쓰는 법

- **결함의 맥락을 물을 때** — owner에게 묻는 것이 맞다. 그 코드를 왜 그렇게
  썼는지는 그 사람만 안다.
- **이슈를 배정할 때** — owner를 그대로 assignee로 넣지 않는다.
  연락 가능성을 먼저 확인하고, 안 되면 `@Woo-JongHo`로 간다.
- **owner가 바뀔 때** — 코드를 실질적으로 다시 쓴 사람이 생기면 옮긴다.
  한 줄 고친 것으로는 안 옮긴다.

## 담당자가 없는 것

`defects.yaml`의 결함 25건에는 owner 필드가 없다.
결함은 `relatedFeature`로 feature에 붙고, 그 feature의 owner가 곧 문의처다.
결함마다 따로 배정하면 feature owner와 갈라진다.
