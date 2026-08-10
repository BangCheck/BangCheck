## Summary

<!-- 무엇을, 왜. 한두 문단. -->

## Linked Issue

closes #

## Changes

<!-- 변경 목록. 리뷰어가 어디부터 볼지 알 수 있게. -->

## Screenshots (optional)

## Checklist

- [ ] 로컬에서 동작 확인
- [ ] 관련 문서 갱신 (필요 시)
- [ ] 브랜치명이 `{type}/{issue-number}-{slug}` 형식
- [ ] `.project-atlas/registry/**` 를 고쳤다면 `npm run atlas:snapshot` 결과물
      (`frontend/src/features/research/atlas-snapshot.json`)을 **같은 PR 에** 커밋

<!--
마지막 항목이 왜 있나 (#237)

  registry 를 고치면 스냅샷이 낡는다. 게이트(`Verify registry resolves`)가 그것을
  잡아 PR 을 떨어뜨리지만, **재생성은 하지 않는다** — 봇이 커밋을 밀어 넣으면
  작성자가 만들지 않은 변경이 자기 PR 에 생기기 때문이다. 무엇을 실행해야
  하는지 말하고 멈추는 쪽을 택했다.

  그래서 이 줄은 게이트를 대신하는 것이 아니라 **게이트가 떨어뜨렸을 때 무엇을
  하면 되는지**를 미리 알려 주는 자리다.

  2026-08-06 이전에는 이 게이트가 없었고, registry 만 고친 PR 은 배포 워크플로의
  `paths: frontend/**` 필터에도 안 걸려
  **아무 신호 없이** 낡은 스냅샷이 머지됐다.
  #238 이 실제로 그렇게 통과했다.
-->

