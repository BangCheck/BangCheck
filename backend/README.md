# BangCheck Backend

Spring Boot 3.2.5와 Java 17로 실행되는 BangCheck API다. 이 디렉터리의 Gradle wrapper가 build와 test의 정식 진입점이다.

## Prerequisites

- JDK 17
- Gradle wrapper 8.13 — 별도 Gradle 전역 설치 불필요
- Docker — MySQL/Testcontainers integration test에서 사용

저장소는 특정 사용자의 `JAVA_HOME`, Homebrew Cellar patch 경로 또는 전역 Gradle cache를 강제하지 않는다. `.java-version`은 요구 major를 선언하고 실제 JVM 선택은 개발 환경 또는 CI가 담당한다.

macOS에서 Homebrew JDK 17을 사용할 때 현재 shell에만 적용하려면:

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="${JAVA_HOME}/bin:${PATH}"
```

## Build and Test

```bash
./gradlew --version
./gradlew test
```

`./gradlew --version`의 Daemon JVM과 test compiler toolchain이 Java 17인지 먼저 확인한다. JDK가 없으면 Java target을 다른 major로 바꾸지 말고 JDK 17을 설치한다.

## Portability Gate

```bash
bash scripts/check-portable-build.sh
bash scripts/check-portable-build.sh --self-test
```

이 검문은 tracked build 파일에 다음 결함이 들어오는 것을 차단한다.

- 사용자 home 또는 Homebrew Cellar 절대경로
- tracked `org.gradle.java.home`
- Java toolchain과 `.java-version`의 17 이탈

Gradle cache는 wrapper checksum·압축 해제·dependency resolution 오류처럼 손상 근거가 있을 때 exact target만 지운다. 일반적인 JDK 탐지 실패를 전체 cache 삭제로 해결하지 않는다.

## Observable Baseline

Docker가 실행 중인 환경에서 현재 승인된 route, Flyway checksum, boot `Start-Class`와 정보성 bean·runtime dependency를 비교한다.

```bash
./gradlew atlasBaselineTest
./gradlew atlasBaselineCompare
```

정보성 bean 또는 runtime dependency가 승인 digest와 다르면 비교는 기본적으로 실패한다. 기대된 변경일 때만 reviewer가 확인할 owner와 reason을 명시한다.

```bash
./gradlew atlasBaselineCompare \
  -PatlasInfoChangeOwner='@owner' \
  -PatlasInfoChangeReason='approved change summary'
```

기준 commit의 candidate는 반드시 새 빈 디렉터리에 캡처한다.

```bash
bash scripts/capture-observable-baseline.sh <git-ref> <candidate-dir>
```

capture 성공은 검증 통과나 승인 baseline 갱신을 뜻하지 않는다. candidate diff와 authority receipt를 별도로 리뷰한 후 승인 파일을 명시적으로 승격해야 하며, compare command는 candidate를 자동으로 복사하지 않는다.

## Local MySQL

```bash
docker compose up -d mysql
```

기본 local port는 `3307`, database/user/password는 `docker-compose.yml`을 따른다. 제품과 테스트 데이터는 혼용하지 않는다.

## API Contract

- 기본 prefix: `/api/v1`
- checklist 조회 예외 경로: `/api/checklist`
- 인증·오류·DB 계약 변경은 characterization test를 먼저 추가한 뒤 수행한다.
