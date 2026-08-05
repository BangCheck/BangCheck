# Hermes 프로필 스크립트

이 디렉터리의 스크립트는 **이 저장소가 정본**이고, Hermes 머신에는 배포된 사본이 산다.

```
정본   .project-atlas/tools/hermes/
배포   woojongho:~/HermesHome/profiles/bangcheck/scripts/
```

## 왜 저장소에 두는가

원격 머신에서 직접 고치면 검토도 버전관리도 안 된다. 무엇이 도는지 아무도
확인할 수 없고, 그 기계가 죽으면 스크립트가 함께 사라진다.

## 배포

```bash
scp .project-atlas/tools/hermes/atlas_issue_analyzer.py \
    woojongho:~/HermesHome/profiles/bangcheck/scripts/
```

## RPA 봇과 섞지 않는다

`~/HermesHome/scripts/` 에는 다른 프로젝트용 봇이 이미 돈다 —
`woo-world` 의 GMBKOREA 4종과 KMpark-RPA 를 2분마다 폴링한다.
BangCheck 봇은 `profiles/bangcheck/` 안에서만 돌고 그쪽을 건드리지 않는다.

## 2단 구조

```
1단  GitHub Actions        이슈 본문에 경로가 있으면 그것으로 배정
2단  이 스크립트 (Hermes)   경로가 없을 때만. LLM 이 코드에서 경로를 찾는다
```

LLM 은 **경로만 찾는다.** 배정은 두 단계가 같은 규칙(`triage_route.py`)을 쓴다.
LLM 이 배정까지 하면 규칙이 두 벌이 되고, 둘이 어긋나도 아무도 모른다.

LLM 이 낸 경로는 실재 검사를 거친다. 지어낸 경로는 근거에서 빠진다.
