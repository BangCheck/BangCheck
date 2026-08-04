# Hermes Agent 기반 BangCheck Atlas 튜닝 봇 — 1단계 조사·설계

- 작성일: 2026-08-04
- 단계: **1단계(조사·설계·안전한 준비)**. 코드 구현, Discord 앱 등록, 토큰 발급, config 변경은 **하지 않았다.**
- 조사 대상: `hermes-agent` v0.17.0 (NousResearch), 코드 경로 `~/.hermes/hermes-agent/`
- 조사 방법: 소스 코드 직접 열람 + 읽기 전용 CLI 실행(`profile list`, `gateway list/status/--help`) + 실행 중 프로세스·라이브 로그 확인 + 저장소 레지스트리 직접 집계
- 시크릿 취급: 이 문서에는 어떤 토큰·비밀값·웹훅 URL도 적지 않는다. **존재 여부만** 기록한다.

---

## 0. 봇의 목적 — 상태 브리핑이 아니라 Atlas 튜닝이다

이 봇은 "오늘 뭐 했어?"를 답하는 브리핑 봇이 아니다.

**Atlas(`/project-map`)를 만들고 나면 반드시 남는 빈칸과 어긋남이 있다. 그 빈칸을 대화로 메우는 것**이 목적이다. 사용자 표현 그대로: *"완료가 되고 나서 누락되거나 안 되는 것들이 있겠지? 그걸 이 챗봇을 통해 가져가는 거지."*

핵심은 **봇이 새로 판단하지 않는다**는 것이다. Atlas는 이미 자기 빈칸을 데이터로 세어 놓았다. 봇은 그것을 읽어 말하고, 대화로 받은 답을 되쓴다.

이 설계 방향은 Atlas 생성기 자신이 이미 예고해 둔 것이다 — `.project-atlas/tools/pm_snapshot.py:20`:

> `나중에 Hermes가 갱신할 자리도 이 파일이다.`

그리고 `pm_snapshot.py:199-201`:

```python
# 연결 규약이 아직 없다. 빈 값을 그대로 둬서 화면이 '없음'을 말하게 한다 —
# 있는 척하는 것보다 비어 있는 게 낫다. Hermes가 채울 자리.
"links": {"source": None, "byFeature": {}},
```

**즉 이 봇은 없던 요구를 새로 만드는 게 아니라, Atlas가 비워 둔 자리를 채우러 오는 것이다.**

### 0.1 실측한 빈칸 — 사전 정보와 다른 부분이 있어 정정한다

작업 지시에 적힌 수치를 그대로 쓰지 않고 저장소에서 직접 셌다. **두 군데가 달랐다.**

| 빈칸 | 실측값 | 근거 |
|---|---|---|
| `links.byFeature` 비어 있음 | ✅ 맞음. `{}`, `links.source`도 `null` | `atlas-snapshot.json` 실측; `pm_snapshot.py:201`에 **하드코딩된 빈 값** — 계산되는 게 아니다 |
| 결함 lifecycle 전부 `OBSERVED` | ✅ 맞음 (**단 17건이 아니라 25건**) | `defects.yaml` 25개 엔트리, `issue` 필드를 가진 것 **0개** |
| registry 미등재 API 호출이 `featureId: null` | ⚠️ **현재 스냅샷에는 0건이다** | 메커니즘은 있다(`pm_snapshot.py:142-155`의 `__unmapped__` 버킷). 다만 이번 생성에서는 모든 호출이 registry 기능으로 해소됐다 |
| registry 19개 feature 전부 `tests: []` | ✅ 맞음 (**19개 확정**). 정확히는 14개가 명시적 `tests: []`, 5개는 `tests` 키 자체가 없음 | `ls .project-atlas/registry/FT-*.yaml \| wc -l` = 19; `grep -L "^tests:"` = 5, `grep -l "^tests: \[\]"` = 14 |
| `custom-cards.ts`의 operationId 8개가 `OP-*` 미사용 | ✅ 맞음. **다만 전체로는 7개 카드 파일에 28개** | `custom-cards.ts` 8개(`checklist.getCustomizedItems` 등 점 표기), map/report/login/landing 등 카드에 20개 더 |

추가로 셌다 (모두 `pyyaml`로 직접 집계):

- 결함 25건의 `severity`: **P1 4건, P2 13건, P3 8건**
- 결함 25건의 `disposition`: `FIX_PLANNED` 12, `NEEDS_PRODUCT_DECISION` 6, `RECORD_ONLY` 3, `UNDECIDED` 2, `FIX_WHEN_SLICE_MIGRATED` 2
- feature 19개의 `status`: **전부 `PLANNED`** (소유 operation 28개, `uses` 참조 2개)
- 스냅샷: 최상위 키 4개(`generator`, `note`, `pages`, `links`), 페이지 13개, 결함 참조 44건 전부 `lifecycle: OBSERVED`

### 0.2 조사 중 발견한 실제 결함 — 지금 고쳐야 링크가 성립한다

**`.project-atlas/project.yaml`의 저장소 이름이 틀렸다.**

| 출처 | 값 |
|---|---|
| `.project-atlas/project.yaml` | `repo: BangCheck/BangCheck` |
| `_wood/context/current.yaml:9` | `repo: SWYP-Backend/BangCheck` |
| **실제 git remote (실측)** | **`https://github.com/SWYP-Backend/BangCheck.git`** |

`links.byFeature`를 채운다는 건 결국 GitHub Issue/PR URL을 만든다는 뜻인데, **잘못된 owner로 링크를 만들면 전부 죽은 링크가 된다.** 봇을 붙이기 전에 `project.yaml`을 고쳐야 한다.

같은 파일의 `workingBranch: v0.2.0`도 현재 체크아웃 브랜치 `atlas/baseline`과 다르다.

> 이것은 기존 계획 문서의 미해결 질문 1번(*"실제 GitHub 정본은 `BangCheck/BangCheck`인가, 운영 문서의 다른 owner/repository인가?"*)에 대한 답이기도 하다. **답은 `SWYP-Backend/BangCheck`이고, Atlas marker가 틀렸다.**

---

## 1. 실행 환경 — 조사 중 발견한 중대한 전제 오류

조사를 시작할 때의 전제는 "Hermes home은 `~/.hermes`"였다. **틀렸다.**

```
~/Library/LaunchAgents/ai.hermes.gateway.plist
  ProgramArguments: /Users/woojongho/.hermes/hermes-agent/venv/bin/python ...
  EnvironmentVariables:
    HERMES_HOME = /Users/woojongho/HermesHome      ← 여기
  StandardOutPath:  /Users/woojongho/HermesHome/logs/gateway.log
```

| 것 | 실제 위치 |
|---|---|
| Hermes **코드**(venv 포함) | `~/.hermes/hermes-agent/` |
| 실행 중 gateway의 **상태·설정 home** | `~/HermesHome/` |
| `~/.hermes/`의 config.yaml·.env·state.db | **살아 있는 gateway가 쓰지 않는 낡은 사본** |

그리고 PATH 위의 `hermes`는 `HERMES_HOME`을 설정하지 않는다:

```
/Users/woojongho/.local/bin/hermes
  exec "/Users/woojongho/.hermes/hermes-agent/venv/bin/hermes" "$@"
```

`hermes_constants.get_hermes_home()`(`hermes_constants.py:75`)는 `HERMES_HOME`이 비면 `~/.hermes`로 떨어진다. **터미널에서 그냥 `hermes`를 치면 `~/.hermes`를, launchd gateway는 `~/HermesHome`을 본다.**

> **최우선 리스크.** 2단계에서 토큰을 `~/.hermes/.env`에 넣으면 **실행 중 봇에는 아무 효과가 없다.** 반드시 `HERMES_HOME=/Users/woojongho/HermesHome`을 명시한다.

아래 모든 답변은 **`~/HermesHome`이 정본**이라는 전제다.

---

## 2. 일곱 개 질문에 대한 답

### Q1. 한 Hermes 인스턴스가 Discord 봇 토큰을 여러 개 물 수 있는가?

**답: 하나의 프로필(=하나의 config) 안에서는 불가능하다. 다만 하나의 gateway *프로세스*는 `multiplex_profiles`로 여러 프로필의 Discord 봇을 동시에 물 수 있다 — 프로필당 봇 하나, 토큰은 서로 달라야 한다.**

**(a) 스키마상 `discord:`는 단일 매핑, `token`은 단일 문자열**

- `gateway/config.py:319-323` — `PlatformConfig.token: Optional[str] = None  # Bot token (Telegram, Discord)`. 리스트 형태 없음
- `gateway/config.py:373` — `token=data.get("token")`
- `gateway/config.py:965-966` — `if not isinstance(platform_cfg, dict): continue`. 리스트로 쓰면 **조용히 무시**
- `gateway/config.py:502` — `GatewayConfig.platforms: Dict[Platform, PlatformConfig]`. Platform enum이 키. `discord:`를 두 번 쓰면 뒤엣것이 덮어쓴다
- Discord 전용 `DiscordConfig`는 **없다.** 범용 `PlatformConfig`를 쓰고, 고유 설정은 `plugins/platforms/discord/adapter.py`의 `_apply_yaml_config`(등록 `adapter.py:7163`)가 `DISCORD_*` 환경변수로 옮긴다

**(b) 기동 루프는 Platform enum당 어댑터 하나**

- `gateway/run.py:2580` — `self.adapters: Dict[Platform, BasePlatformAdapter] = {}`
- `gateway/run.py:6041` — `for platform, platform_config in self.config.platforms.items():`
- `gateway/run.py:6080` — `self.adapters[platform] = adapter`
- `Platform` enum(`gateway/config.py:136-165`)에 `DISCORD` 하나. `discord:work` 같은 계정별 인스턴스 개념 없음

**(c) 진짜 다중 봇 수단은 "프로필 멀티플렉싱"**

- `gateway/config.py:541` — `multiplex_profiles: bool = False` (파싱 `config.py:702-707, 855-856`)
- `gateway/run.py:2586` — `self._profile_adapters: Dict[str, Dict[Platform, BasePlatformAdapter]]` — 프로필로 한 겹 더 감싼 별도 맵
- `gateway/run.py:7418-7550` — 부차 프로필 어댑터 기동
- 공식 문서 `website/docs/user-guide/multi-profile-gateways.md:158-165` — "Discord … work fine multiplexed, but each profile must supply its own bot token"

**(d) 확인 못 한 것 — 정직하게 남긴다**

부차 프로필이 자기 토큰을 **어떻게** 공급하는지 확정 못 했다. `load_gateway_config()`는 프로세스 전역 `os.environ`에서 읽고(`gateway/config.py:1269-1273`), `_profile_runtime_scope`는 `os.environ`을 건드리지 않는다(`gateway/run.py:1450-1453`). 프로필별 `.env` 경로가 동작하는지 **검증 못 했다.**

또한 Discord의 **비-토큰 동작 설정**은 전역 `DISCORD_*` 환경변수를 거치므로(`adapter.py:7040-7122`), 멀티플렉싱 시 두 봇이 이를 **공유할 가능성이 높다.** 프로필별 스코프 코드를 못 찾았다 → **확인 못 함(추정 제약)**.

이 두 미확인 때문에 §5는 멀티플렉싱이 아니라 **프로세스 분리**를 고른다.

---

### Q2. 인스턴스를 분리하는 정식 방법이 있는가?

**답: 있다. `HERMES_HOME` 환경변수와 그 위의 1급 기능 "프로필(profile)"이다.**

- `hermes_constants.py:58,75` — `get_hermes_home()`이 `HERMES_HOME`을 읽음
- `hermes_cli/subcommands/profile.py:17-20` — 도움말이 그대로 답이다:
  > `"profile", help="Manage profiles — multiple isolated Hermes instances"`
- 하위 명령: `list`, `use`, `create`(`--clone`/`--clone-all`/`--clone-from`/`--no-alias`/`--no-skills`/`--description`), `delete`, `describe`
- `hermes_cli/main.py:336-415` — `_apply_profile_override()`가 argparse **이전에** `-p`/`--profile`을 선파싱해 `HERMES_HOME`을 세팅. 이름 정규식 `^[a-z0-9][a-z0-9_-]{0,63}$`(`main.py:436`)
- `hermes_cli/main.py:455` — 플래그 없으면 root의 `active_profile`을 sticky default로
- `hermes_constants.py:113-150` — 프로필은 `<root>/profiles/<name>`. `HERMES_HOME`이 `~/.hermes` 바깥이면 **그 경로가 root**(`:142-150`) → 우리 환경에선 **`~/HermesHome/profiles/<name>`**
- `hermes_cli/profiles.py:395` — `~/.local/bin/<name>` wrapper 스크립트 생성
- **gateway도 프로필 단위:** `hermes_cli/gateway.py:2395-2398` —
  > "Profile `~/.hermes/profiles/coder` → `ai.hermes.gateway-coder.plist`"

실측(읽기 전용):

```
$ HERMES_HOME=/Users/woojongho/HermesHome hermes profile list
 Profile      Model           Gateway    Alias   Distribution
 ◆default     gpt-5.6-luna    running    —       —

$ hermes gateway list
Gateways:
  ✓ default (current)        — PID 50517
```

**현재 프로필은 `default` 하나뿐.** `~/HermesHome/profiles/`와 `active_profile`은 아직 없다.

> 사전 정보는 기본 모델을 `gpt-5.6-sol`이라 했으나, 실측 `profile list`와 `~/HermesHome/config.yaml:463`은 **`gpt-5.6-luna`** 다.

---

### Q3. 인스턴스를 분리하면 무엇이 갈라지고 무엇이 공유되는가?

**프로필마다 갈라지는 디렉터리** (`hermes_cli/profiles.py:39-53`, `_PROFILE_DIRS`)

`memories/`, `sessions/`, `skills/`, `skins/`, `logs/`, `plans/`, `workspace/`, **`cron/`**, `home/`

**프로필 루트에 각자 존재하는 파일**

| 항목 | 근거 |
|---|---|
| `config.yaml`, `.env`, `SOUL.md` | `profiles.py:56-60` |
| `state.db` (+`-wal`,`-shm`) | `hermes_state.py:121` — `DEFAULT_DB_PATH = get_hermes_home() / "state.db"` |
| `kanban.db` | `kanban_db.py:498` — `kanban_home() / "kanban.db"` |
| `gateway.pid`, `gateway_state.json` | `profiles.py:73-77` (클론 시 오히려 제거) |
| launchd 서비스 | `gateway.py:2395-2398` |

**공유되는 것**

| 항목 | 근거 |
|---|---|
| Hermes 소스+venv, `bin/`, `node_modules/`, `.worktrees/` | `profiles.py:95-101` — 클론에서 제외. 호스트당 하나 |
| **gateway 토큰 락 디렉터리** | `gateway/status.py:64-70` — `~/.local/state/hermes/gateway-locks`. **`HERMES_HOME`과 무관한 머신 전역** → Q4 |

**판정:** 프로필을 나누면 세션·기억·스킬·cron·kanban·state가 **완전히 갈라진다.** 원하는 격리를 정확히 준다. 반대로 "BangCheck 봇이 woo-linear의 kanban을 본다"는 기대는 성립하지 않는다 — **두 쪽이 공유해야 할 것은 저장소 파일(`.project-atlas/`, GitHub)뿐이고, Hermes 내부 상태를 공유 채널로 써서는 안 된다.**

---

### Q4. `_acquire_platform_lock('discord-bot-token', ...)`은 무엇을 막는가?

**답: 같은 머신에서 *동일한 Discord 봇 토큰*이 두 번 동시에 접속되는 것. 서로 다른 토큰끼리는 전혀 충돌하지 않는다.**

`gateway/status.py:882-887` 도크스트링이 명시적이다:

```
"""Acquire a machine-local lock keyed by scope + identity.

Used to prevent multiple local gateways from using the same external identity
at once (e.g. the same Telegram bot token across different HERMES_HOME dirs).
"""
```

1. **락 키 = scope + 토큰 해시.** `status.py:108-109` — `_get_lock_dir() / f"{scope}-{_scope_hash(identity)}.lock"`. 호출부 `adapter.py:905`에서 `identity = self.config.token` → 토큰이 다르면 파일이 다르다
2. **락 위치는 머신 전역.** `status.py:64-70` — `~/.local/state/hermes/gateway-locks/`. **`HERMES_HOME` 아래가 아니다** → 프로필을 나눠도 같은 토큰이면 잡힌다 (`HERMES_GATEWAY_LOCK_DIR`로 override 가능)
3. **stale 락 자동 회수.** `status.py:898-942` — JSON 파손, PID 사망, `start_time` 지문 불일치(PID 재사용) 시 회수. macOS는 `/proc`가 없어 `psutil.create_time()` 사용
4. **실패 시 재시도 안 함.** `gateway/platforms/base.py:2548-2558` — `"Discord bot token already in use (PID N). Stop the other gateway first."` + `_set_fatal_error(..., retryable=False)` → **죽는다**
5. 멀티플렉싱 시 프로세스 내부 지문 검사 추가: `gateway/run.py:7515-7528`

> **실무적 의미: 새 봇에 *새 Discord Application/토큰*을 쓰는 한 이 락은 아무것도 막지 않는다.** 이 락은 "같은 토큰을 두 프로세스가 폴링해 메시지가 무작위로 갈리는 사고"만 막는다. **기존 토큰 재사용은 금지** — 두 번째 프로세스가 즉시 fatal로 죽는다.

실측: `~/.local/state/hermes/gateway-locks/` — **비어 있다.** 지금 어떤 Discord 봇도 락을 쥐고 있지 않다 → Q5.

---

### Q5. 현재 Hermes가 실행 중인가? Discord 봇이 이미 붙어 있나?

**답: gateway는 실행 중. Discord 봇은 붙어 있지 않다 — 토큰이 무효(401)라 5분마다 재접속 실패 중.**

**(a) 프로세스 — 실행 중**

```
$ hermes gateway status
✓ Gateway is supervised by launchd (PID 50517)
$ ps -p 50517
50517 Mon Aug  3 07:09:01 2026  ... -m hermes_cli.main gateway run --replace
```

launchd 감독 하 → **죽여도 자동 재시작.** (지시대로 건드리지 않았고, 조사 후에도 PID 50517 그대로임을 확인했다.)

**(b) Discord — 설정은 켜져 있으나 접속 실패**

- `~/HermesHome/.env`에 `DISCORD_BOT_TOKEN`, `DISCORD_HOME_CHANNEL` 키 **존재**(값은 읽지도 기록하지도 않음)
- `~/HermesHome/config.yaml:523-550`에 `discord:` 블록 하나. **`token` 필드 없음** — 토큰은 `.env`에서만(`gateway/config.py:1269-1273`)
- 라이브 로그 `~/HermesHome/logs/gateway.log`, **2026-08-04 22:23:32**:

```
ERROR [Discord] Failed to connect to Discord: Improper token has been passed.
discord.errors.HTTPException: 401 Unauthorized (error code: 0)
discord.errors.LoginFailure: Improper token has been passed.
INFO  gateway.run: Reconnect discord failed, next retry in 300s
```

→ **현재 토큰은 무효이거나 폐기됐다.**

- 그 이전(낡은 `~/.hermes/logs/gateway.log`, 2026-07-21)의 실패 사유는 **달랐다**:

```
discord.errors.PrivilegedIntentsRequired: Shard ID None is requesting privileged
intents that have not been explicitly enabled in the developer portal.
```

→ 토큰이 유효했던 시절엔 **Privileged Intents(MESSAGE CONTENT INTENT)가 꺼져 있어** 실패했다. **새 토큰을 발급해도 이 설정을 켜지 않으면 같은 벽에 다시 부딪힌다.**

- cron 잡 배달 실패에도 같은 증상: `~/HermesHome/cron/jobs.json` 잡 `c6304431086f`의
  `"last_delivery_error": "delivery error: Discord API error (401)"`
- `_wood/context/current.yaml`의 `blockers:` 에도 이미 기록돼 있다: `Discord bot token (일일 알람 미발송)`

**(c) `gateway_state.json`의 함정**

`~/.hermes/gateway_state.json`은 pid 1185 / 2026-07-21에 멈춰 있다 — **낡은 home의 낡은 파일.** 살아 있는 건 `~/HermesHome/gateway_state.json`(오늘 22:23 갱신).

**(d) pm-discord-hub — 미설정·미실행**

`~/pm-discord-hub/.env`가 **없다**(`.env.example`만; 필요 키 `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `PROJECT_NAME`). 프로세스 목록에도 없다.

**(e) woo-linear RPA — 실행 중, 정상, Discord 무관**

`~/HermesHome/cron/jobs.json`:

| id | 이름 | 주기 | script | no_agent | deliver | 상태 |
|---|---|---|---|---|---|---|
| `c6304431086f` | 월간 이력서 업데이트 | `0 9 1 * *` | — | false | `origin` | error |
| `e1553c343c6c` | RPA commit to Linear projection | every 2m | `rpa_linear_projection.sh` | **true** | **`local`** | **ok** |

RPA 잡은 `no_agent: true` + `deliver: local` — **모델도 안 깨우고 Discord로 배달하지도 않는다.**

> **결론: woo-linear RPA는 Discord 어댑터를 전혀 쓰지 않는다.** "RPA와 무관하게 도는 별개 봇"은 이미 절반 충족돼 있다. 남은 리스크는 Discord가 아니라 **같은 프로필을 공유할 때의 cron/세션/state 간섭**이다.

---

### Q6. Hermes가 대화 중 이 저장소의 파일을 수정하게 하려면 무엇이 필요한가? sandbox·승인 정책은 어떻게 걸리는가?

**답: 지금 당장 아무 설정 없이도 가능하다. 그리고 그게 문제다.**

조사를 시작할 때의 예상은 "승인 게이트가 강하게 걸려 있을 것"이었다. **틀렸다. 파일 쓰기에는 승인이 걸리지 않는다.**

**(a) 결정적 사실 — `write_file`/`patch`는 승인 대상이 아니다**

파일 도구는 정확히 4개다: `read_file`, `write_file`, `patch`, `search_files` (`toolsets.py:40,189-193`; 구현 `tools/file_tools.py:1329`(write), `:1412`(patch)).

승인 시스템(`tools/approval.py`, 2128줄)의 게이트 진입점은 **둘뿐**이다 — `check_all_command_guards`(셸 명령)와 `check_execute_code_guard`(코드 실행). 이 둘만이 `_await_gateway_decision`(`tools/approval.py:1409-1423`)을 호출한다.

`tools/file_tools.py`에서 `approval`은 **주석으로만 등장한다**(`:395`, `:440`). 즉:

> **`write_file`과 `patch`는 CLI·gateway·Discord 어느 표면에서도 승인 게이트를 통과하지 않는다.**

유일한 예외는 ACP/Zed 세션이다 — `model_tools.py:1090-1102`가 `maybe_require_edit_approval`을 부르지만, 그 requester는 ContextVar로 **ACP에서만** 바인딩된다. 같은 파일 `:1092-1093` 주석이 CLI/gateway 경로는 영향받지 않는다고 명시한다.

**(b) Discord는 이미 파일 도구를 다 갖고 있다**

`~/HermesHome/config.yaml:699-760`:

```yaml
platform_toolsets:
  discord: [browser, clarify, code_execution, computer_use, cronjob,
            delegation, file, image_gen, memory, session_search,
            skills, terminal, todo, tts, vision, web]
```

**`file`과 `terminal`이 둘 다 켜져 있다.** Discord는 CLI와 동일한 도구 표면을 갖는다. `toolsets.py:451-458`의 `hermes-discord` 정의도 *"full access (terminal has safety checks via dangerous command approval)"* 라고 적혀 있는데 — **괄호 안의 안전장치는 terminal에만 해당하고 file에는 해당하지 않는다.**

그리고 `discord.allowed_channels: ''`(`config.yaml:526`)는 **빈 값 = 채널 제한 없음**이다.

**(c) 승인이 실제로 걸리는 것 — 셸 명령. Discord에 버튼 4개가 뜬다**

셸 명령에 대해서는 승인 흐름이 잘 동작한다. 체인 전체를 확인했다:

1. `gateway/run.py:1703` — gateway 기동 시 **강제로** `os.environ["HERMES_EXEC_ASK"] = "1"`
2. `gateway/run.py:16736` — 매 실행 전 `register_gateway_notify(...)` 등록
3. `gateway/run.py:16535-16620` — 어댑터가 `send_exec_approval`을 지원하면 **버튼 방식** 우선(`:16566-16584`). 명령의 자격증명은 먼저 마스킹(`:16561`)
4. `plugins/platforms/discord/adapter.py:4693-4738` — Discord 구현, embed 제목 `"⚠️ Command Approval Required"`(`:4721`)
5. `plugins/platforms/discord/adapter.py:5798-5890` — `ExecApprovalView`, **버튼 4개**: Allow Once(`:5872`) / Allow Session(`:5878`) / Always Allow(`:5884`) / Deny(`:5886`). 클릭은 `self._allowed_user_ids`로 인가 검사(`:5839`)
6. Discord 슬래시 명령 `/approve`·`/deny`도 등록됨(`adapter.py:3586-3594`)
7. 에이전트 스레드는 `_await_gateway_decision`(`approval.py:1409`)에서 블록되며, **`approvals.gateway_timeout` 기본 300초** 후 타임아웃(`:1464-1469`)

> 앞서 별도 경로로 확인한 3버튼 UI(`gateway/run.py:12563-12570`)는 **슬래시 명령 확인용**으로, exec 승인(4버튼)과 다른 흐름이다.

**(d) 승인 모드 — 유효값을 확정했다**

`approvals.mode`(`tools/approval.py:1121-1122`, 문서 `hermes_cli/config.py:2320-2326`):

- **`manual`** — 항상 물어봄 (기본, 현재 설정)
- **`smart`** — 보조 LLM이 저위험 명령을 자동 승인 (`approval.py:1672,1940`)
- **`off`** — 전부 건너뜀, `--yolo`와 동일 (`approval.py:1563`)

`HERMES_YOLO_MODE` 환경변수 우회도 있으나 import 시점에 동결된다(`approval.py:29-32`) — 스킬이 실행 중에 켤 수 없게 한 의도적 설계다.

**(e) ⚠️ 현재 `command_allowlist`에 위험한 항목이 이미 들어 있다**

`~/HermesHome/config.yaml:574-576`:

```yaml
command_allowlist:
  - recursive delete                                        # ← 재귀 삭제가 사전 승인됨
  - stop/restart hermes launchd service (kills running agents)
```

**`default` 프로필에서는 재귀 삭제가 이미 무승인으로 통과한다.** 이 상태의 프로필에 Discord 대화 봇을 붙이는 것은 위험하다.

> **→ 이것이 `hermes profile create`에 `--clone`을 쓰면 안 되는 또 하나의 이유다.** 새 프로필은 이 allowlist를 물려받지 않는다.

**(f) sandbox — OS 수준 격리가 아예 없다**

`sandbox-exec`/seatbelt, landlock, bubblewrap을 Python 소스 전체에서 검색한 결과 **0건**이다. 이 코드베이스에서 "sandbox"는 **terminal 실행 백엔드**(Docker/Singularity/Modal/Daytona)를 뜻한다.

현재 설정은 꺼져 있다 — `~/HermesHome/config.yaml:80-81`:

```yaml
terminal:
  backend: local            # 컨테이너 격리 없음
```

존재하는 유일한 방어는 **애플리케이션 수준 거부 목록**이다:

- `_SENSITIVE_PATH_PREFIXES`(`tools/file_tools.py:396-399`) — `/etc/`, `/boot/`, `/private/var/` 등 쓰기 거부
- Hermes 자신의 `config.yaml`은 쓰기 차단(`tools/file_tools.py:440-448`) — **프롬프트 인젝션으로 `approvals.mode`를 못 뒤집게 하려는 의도**
- 교차 프로필 경고(`tools/file_tools.py:487-540`)는 **경고일 뿐**이다. 그 도크스트링이 직접 말한다:
  > *"Defense-in-depth, NOT a security boundary — the terminal tool runs as the same OS user and can write any of these paths directly."* (`:517-519`)

**`write_file`/`patch`에는 쓰기 허용 경로 화이트리스트가 없다.** 위 거부 목록 밖의 모든 경로가 쓰기 가능하다.

**(g) 작업 디렉터리 — 지금은 저장소가 아니라 홈이다**

`gateway/run.py:1710-1713`:

```python
_configured_cwd = os.environ.get("TERMINAL_CWD", "")
if not _configured_cwd or _configured_cwd in {".", "auto", "cwd"}:
    _fallback = os.getenv("MESSAGING_CWD") or str(Path.home())
    os.environ["TERMINAL_CWD"] = _fallback
```

현재 `terminal.cwd: .`(`config.yaml:83`)는 **sentinel 값**이라 이 분기에 걸려 **홈 디렉터리로 떨어진다.** Discord 턴은 `$HOME`에서 시작한다.

파일 도구는 `_resolve_path_for_task`(`tools/file_tools.py:285`)로 경로를 푸는데, sentinel/상대 경로는 명시적으로 거부한다(`:264-268`) — 낡은 `"."`가 조용히 엉뚱한 체크아웃을 가리키는 걸 막기 위해서다.

**채널별 workdir 고정은 없다.** `channel_workdir`/`channel_cwd`는 코드에 존재하지 않는다. 채널별로 설정 가능한 것은 `channel_prompts`(`gateway/platforms/base.py:1991-2011`)와 `channel_skill_bindings`(`:2014-2060`)뿐이다 — **프롬프트와 스킬이지 작업 디렉터리가 아니다.**

**프로필별 고정은 가능하다.** 프로필마다 자기 `config.yaml`을 가지므로 `terminal.cwd`를 프로필 단위로 다르게 줄 수 있다. (다만 Discord *채널*을 특정 프로필에 묶는 메커니즘은 찾지 못했다 — **확인 못 함**.)

**(h) 종합 판정 — 무엇을 실제로 해야 하는가**

| 층 | 현재 | 판정 | 2단계 조치 |
|---|---|---|---|
| 파일 쓰기 승인 | **없음** | ❌ **가장 큰 구멍** | **`file` toolset을 프로필에서 제거한다** — 승인으로 못 막으니 도구 자체를 뺀다 |
| 셸 명령 승인 | manual + Discord 4버튼 | ✅ 잘 동작 | 유지. `mode`를 `smart`/`off`로 절대 바꾸지 않는다 |
| `command_allowlist` | `recursive delete` 사전 승인 | ❌ 위험 | 새 프로필은 물려받지 않음. `--clone` 금지 |
| sandbox | `backend: local`, OS 격리 0 | ❌ 없음 | 도구 표면 축소로 대체 (sandbox를 켜는 건 별도 결정) |
| cwd | `$HOME`으로 떨어짐 | ❌ | 프로필 config에서 저장소 경로로 고정 |
| 채널 제한 | `allowed_channels: ''` (무제한) | ❌ | 테스트 채널 하나로 제한 |

> **핵심 설계 전환:** 원래는 "승인 버튼으로 쓰기를 게이트한다"고 구상했다. **파일 쓰기에 승인이 없으므로 그 구상은 성립하지 않는다.**
>
> 대신 이렇게 뒤집는다: **`file` toolset을 빼서 봇이 `write_file`/`patch`를 아예 호출할 수 없게 하고, 유일한 쓰기 경로를 `terminal`로 실행하는 좁은 스크립트 하나로 만든다.** `terminal`은 승인 게이트가 실제로 걸리는 표면이므로, 그때 Discord 승인 버튼이 뜬다.
>
> 이 전환은 §4의 apply 게이트 설계를 **선택이 아니라 유일한 안전 경로**로 만든다.

---

### Q7. skills/cron으로 "Atlas 스냅샷을 주기적으로 재생성하고 달라진 빈칸을 채널에 올리는" 흐름이 가능한가?

**답: 가능하다. 그리고 기존 RPA 잡이 이미 그 형태로 돌고 있어 검증된 패턴이다. 다만 "제안만 하고 자동 적용하지 않는" 형태여야 한다.**

**(a) cron 잡 스키마 — `create_job()`에서 확정**

정의: `cron/jobs.py:850-1015`. 설계에 쓰이는 필드만 추리면:

| 필드 | 근거 | 역할 |
|---|---|---|
| `schedule` | `jobs.py:852`, 파서 `:316-410` | `"every 30m"` 형태 / 5필드 cron 식(`croniter` 검증 `:358-360`) / ISO 일회성 |
| **`script`** | `jobs.py:862` | **`no_agent=True`면 스크립트가 곧 잡**(stdout 그대로 배달). **`no_agent` 없이 쓰면 stdout이 에이전트 프롬프트에 컨텍스트로 주입된다**(`:885-892`) — 변화 감지 패턴 |
| **`no_agent`** | `jobs.py:866` | LLM을 아예 건너뜀. **`script` 없이 쓰면 생성 시 `ValueError`**(`:944-949`). stdout이 비면 조용히 끝남 |
| **`workdir`** | `jobs.py:865`, 검증 `:714-745` | **절대경로여야 하고 실재하는 디렉터리여야 한다.** 에이전트 잡이면 그 디렉터리의 `AGENTS.md`/`CLAUDE.md`를 시스템 프롬프트에 주입하고 `TERMINAL_CWD`를 설정(`:901-906`) |
| `enabled_toolsets` | `jobs.py:864` | 잡별 toolset 제한. `no_agent=True`면 무시(`:897-900`) |
| `skills` | `jobs.py:857-858` | cron에서는 **강제 선주입**(§d) |
| `context_from` | `jobs.py:863` | 다른 잡의 최근 출력을 컨텍스트로 (8000자 절단, `scheduler.py:1745-1789`) |
| `deliver` / `origin` | `jobs.py:855-856` | §b |

**(b) `deliver` — 특정 Discord 채널로 배달 가능하다**

라우팅: `_resolve_single_delivery_target`(`cron/scheduler.py:813-891`), 다중 팬아웃 `:948-971`.

| 값 | 동작 | 근거 |
|---|---|---|
| `"local"` | 배달 안 함, 디스크에만 저장 | `scheduler.py:817-818` |
| `"origin"` | 잡을 만든 대화로. origin이 없으면 home channel 폴백 | `:820-843` |
| `"discord"` | Discord **home channel**(`DISCORD_HOME_CHANNEL`) | `:876-891`, `scheduler.py:215` |
| **`"discord:<channel_id>"`** | **특정 채널 지정** | `_parse_target_ref` `:845-873` |
| `"discord:<channel_id>:<thread_id>"` | 특정 스레드까지 | 같음 |
| `"all"` | 연결된 모든 플랫폼 (실행 시점에 해석) | `:917-940` |
| 쉼표 조합 | `"origin,all"` 등 | `:942-947` |

CLI 도움말도 확인: *"Delivery target: origin, local, telegram, discord, signal, or platform:chat_id"* (`hermes_cli/subcommands/cron.py:38-40`).

**`DISCORD_HOME_CHANNEL`은 이미 `~/HermesHome/.env`에 설정돼 있다**(키 존재만 확인). 다만 새 프로필은 자기 `.env`를 따로 가지므로 거기에도 넣어야 한다.

**(c) 결정적 안전장치: cron은 승인 경로에서 구조적으로 배제된다**

`tools/approval.py:143-152` — **cron 잡은 origin이 gateway 플랫폼이어도 gateway 승인 컨텍스트가 되지 않는다.** 이유는 코드 주석대로 "보는 사람이 없어서"다. 대신 `approvals.cron_mode`로 떨어진다(`:1319-1330`, `:1576-1590`).

현재 값은 `~/HermesHome/config.yaml:571` — **`cron_mode: deny`**.

> **§4 설계의 뼈대: 주기 실행은 "관측하고 보고"만 하고, 쓰기는 반드시 사람이 있는 대화에서만 일어난다.** config를 안 고쳐도 이미 그렇게 강제된다.
>
> ⚠️ **단, 이것은 셸 명령에만 해당한다.** §Q6(a)에서 확인했듯 `write_file`/`patch`는 승인 경로 자체를 안 타므로 **`cron_mode: deny`도 파일 쓰기는 막지 못한다.** cron 잡에서도 `file` toolset을 빼야 한다 — `enabled_toolsets`로 지정하거나, 애초에 `no_agent: true`로 두면 LLM이 없으니 도구도 없다.

**(d) cron 스크립트의 위치 — 확정했다**

`_run_job_script`(`cron/scheduler.py:1548-1630`):

- 루트는 **`$HERMES_HOME/scripts/`**, 없으면 생성(`:1579-1581`)
- 상대경로는 그 아래로 해석. 절대경로·`~`도 해석 후 **그 디렉터리 안에 있는지 검증**(`:1583-1598`) — 경로 traversal·심볼릭 링크 탈출 모두 거부: `"Blocked: script path resolves outside the scripts directory"`
- 에이전트가 만들 때는 더 엄격 — `tools/cronjob_tools.py:448-470`은 절대경로와 `~`를 아예 거부하고 *"Place scripts in ~/.hermes/scripts/ and use just the filename"* 라고 안내
- 인터프리터는 확장자로 결정: `.sh`/`.bash` → `bash`, 그 외 → `sys.executable`(`:1606-1626`). **셔뱅은 의도적으로 무시한다**
- 자식 프로세스 환경은 정리되어 provider 자격증명이 상속되지 않는다(`:1567-1569`)

기존 RPA 스크립트의 실제 위치: **`/Users/woojongho/HermesHome/scripts/rpa_linear_projection.sh`** (448 B, 권한 `0700`).

→ **BangCheck 프로필의 스크립트는 `~/HermesHome/profiles/bangcheck/scripts/`에 둔다.**

**(e) 스킬 — cron과 대화에서 로딩 방식이 다르다**

| 경로 | 방식 | 근거 |
|---|---|---|
| cron 잡 | **강제 선주입.** `job["skills"]`의 스킬 마크다운 전문을 작업 지시 앞에 붙인다 | `cron/scheduler.py:1697-1896`, 특히 `:1709,1832-1849` |
| 대화 메시지 | **지연 로딩.** 시스템 프롬프트에는 메타데이터 색인만, 본문은 모델이 `skill_view`로 당겨 옴 | `agent/system_prompt.py:282-289`; 스냅샷 `HermesHome/.skills_prompt_snapshot.json` |
| 채널 바인딩 | **`channel_skill_bindings`** — Discord 채널 ID에 스킬을 묶어 자동 로드 | `gateway/platforms/base.py:2014-2060`; Discord 배선 `adapter.py:4116,4128-4138` |

**세 번째가 이 설계에 유용하다.** 현재 config에는 설정돼 있지 않지만, *"특정 Discord 채널에 특정 컨텍스트를 고정"* 하는 데 존재하는 유일한 메커니즘이다. (작업 디렉터리는 못 고정한다 — §Q6(g).)

**(f) `pm_snapshot.py`는 이 용도에 안전하다**

- 순수 읽기 → 단일 파일 통째 덮어쓰기. 네트워크 없음, 삭제 없음
- 같은 입력이면 같은 출력 (재실행 안전)
- CLI: `python3 .project-atlas/tools/pm_snapshot.py [-o 출력경로]` (`pm_snapshot.py:138-141`), 또는 `frontend/`에서 `npm run atlas:snapshot` (`frontend/package.json:11`)
- 의존: `pyyaml`

**주의:** 출력 `frontend/src/features/research/atlas-snapshot.json`(66,886 B)은 **git 추적도 안 되고 `.gitignore`에도 없다.** `git status`에 `??`로 계속 뜨고 **실수로 커밋될 수 있다.** 생성기 `pm_snapshot.py` 자체도 미커밋이다. 주기 실행 전에 git 취급을 정해야 한다.

**(g) 권장 흐름**

```
cron 잡: no_agent: true
        script: atlas_gap_report.sh      (~/HermesHome/profiles/bangcheck/scripts/)
        workdir: <BangCheck 저장소 절대경로>
        schedule: every 6h
        deliver: discord:<채널id>
  └ pm_snapshot.py 재생성
  └ 이전 스냅샷과 diff → 빈칸 수치 비교
  └ 달라진 게 없으면 stdout 비움 → 아무것도 안 보냄 (scheduler.py:1994-1998)
  └ 달라졌으면 요약만 출력 (쓰기 없음)
```

`no_agent: true`이므로 **LLM이 아예 안 돈다 → 도구도 없다 → 파일 쓰기 자체가 불가능하다.** §Q6(a)의 구멍을 원천 차단하는 가장 깨끗한 방법이다.

`hermes_feed.py`가 이미 같은 원칙을 구현하고 있다 — 처리할 게 없으면 모델을 깨우지 않는다. **그 규율을 그대로 따른다.**

**(h) 조사 중 발견한 기존 cron 잡의 문제 둘**

1. 잡 `c6304431086f`(월간 이력서)는 **`deliver: origin`인데 `origin: null`**이다 → `scheduler.py:826-843`의 폴백 분기를 타서 **Discord home channel로 간다.** 의도한 동작인지 확인이 필요하다 (현재는 401로 배달 실패 중이라 증상이 안 보인다)
2. 잡 `e1553c343c6c`(RPA)는 `deliver: local`이라 **출력이 디스크에만 쌓인다.** 이걸 `discord:<channel_id>`로 바꾸는 것이 Q7 요구의 전부이기도 하다 — 다만 **RPA 잡을 건드리는 것은 이 작업 범위 밖이다.**

**(d) `pm_snapshot.py`는 이 용도에 안전하다**

- 순수 읽기 → 단일 파일 통째 덮어쓰기. 네트워크 없음, 삭제 없음, 다른 상태 없음
- 같은 입력이면 같은 출력 (재실행 안전)
- CLI: `python3 .project-atlas/tools/pm_snapshot.py [-o 출력경로]` (`pm_snapshot.py:138-141`), 또는 `frontend/`에서 `npm run atlas:snapshot` (`frontend/package.json:11`)
- 의존: `pyyaml`

**주의 하나:** 출력 파일 `frontend/src/features/research/atlas-snapshot.json`(66,886 B)은 **git 추적도 안 되고 `.gitignore`에도 없다.** `git status`에 `??`로 계속 뜨고 **실수로 커밋될 수 있다.** 생성기 `pm_snapshot.py` 자체도 아직 미커밋이다. 주기 실행을 붙이기 전에 이 둘의 git 취급을 정해야 한다.

**(e) 권장 흐름**

```
cron 잡 (interval, no_agent: true, script: atlas_gap_report.sh, deliver: discord:<채널>)
  └ pm_snapshot.py 재생성
  └ 이전 스냅샷과 diff → 빈칸 수치 비교
  └ 달라진 게 없으면 아무것도 출력하지 않는다  ← hermes_feed.py와 같은 원칙
  └ 달라졌으면 요약만 채널에 올린다 (쓰기 없음)
```

`hermes_feed.py`가 이미 이 원칙을 구현하고 있다 — 처리할 게 없으면 `{"wakeAgent": false}`를 뱉고 모델을 깨우지 않는다. **같은 규율을 그대로 따른다.**

> **확인 못 한 것:** cron `script:`가 디스크 어디에서 해석되는지(상대경로 기준) 코드로 확정하지 못했다. 기존 `rpa_linear_projection.sh`의 실제 위치를 2단계에서 찾아 같은 규약을 따라야 한다.

---

## 3. 경계 — 누가 무엇을 소유하는가

### 3.1 웹훅은 안 된다 — 이미 사용자에게 알린 사항

사용자가 Incoming Webhook URL을 주며 "여기와 연동"을 원했다. **웹훅은 단방향 발신 전용이다.** 메시지 수신·멘션·슬래시 명령·버튼 응답이 전부 불가능하다. 대화하려면 **Bot 토큰**이 필요하다.

기존 계획 문서가 이미 표로 정리해 둔 판정이다(`133043-...` §핵심 판정):

| 기능 | 웹훅만으로 | Bot 필요 |
|---|---:|---:|
| 정해진 시간의 상태 요약 전송 | 가능 | 선택 |
| 사용자의 메시지·멘션 수신 | **불가** | **필요** |
| `/status` 같은 명령 | **불가** | **필요** |
| 스레드 후속 질문 | **불가** | **필요** |
| **승인 버튼 (§4의 apply 게이트)** | **불가** | **필요** |

마지막 줄이 이번 설계에서 결정적이다. **§4의 preview→승인→apply 흐름은 버튼 또는 답장 수신을 전제하므로 웹훅으로는 원리적으로 구현할 수 없다.**

**구성:** 웹훅은 **알림 통로로만** 남긴다(주기 다이제스트 발신). 대화와 승인은 **Bot**이 맡는다.

> ⚠️ 대화에 노출된 웹훅 URL은 **삭제·재발급 대상**이다. 이 문서에는 적지 않았다. 기존 계획 문서 Task 1 Step 4도 같은 조치를 요구한다.

### 3.2 소유권 표

| | **pm-discord-hub** | **woo-linear RPA** | **BangCheck Atlas 봇 (신규)** |
|---|---|---|---|
| 런타임 | Node.js + discord.js, 독립 프로세스 | Hermes cron 잡 `e1553c343c6c` | Hermes gateway Discord 어댑터 |
| 위치 | `~/pm-discord-hub` | `~/HermesHome/cron` + `01_www/skills/woo-rpa-commit-linear/` | (신설) 전용 Hermes 프로필 |
| 현재 상태 | **미설정·미실행** | **실행 중, 정상** (2분 주기) | **없음** |
| 트리거 | 슬래시 명령 | 시간 폴링 | 멘션/명령 + 주기 다이제스트 |
| 소유 데이터 | `data/pm-hub.json` (길드별) | Linear 이슈 | **자체 데이터 없음** |
| 읽는 정본 | 자기 JSON | 커밋 → Linear | **`.project-atlas/registry/` + `atlas-snapshot.json`** |
| 쓰기 대상 | spec/roadmap 레코드 | Linear 코멘트 | **`defects.yaml`의 `issue` 필드 등 (§4)** |
| Discord 토큰 | 자체 앱 (`DISCORD_TOKEN`) | **사용 안 함** | **신규 별도 앱** |

### 3.3 겹치는 지점 — 두 군데

**겹침 ① "현황"을 두 곳이 답한다**

- pm-discord-hub `/roadmap list` = **사람이 손으로 넣은** 의도
- Atlas 봇 = **코드에서 기계가 뽑은** 관측

경계: pm-discord-hub = **의도(intent)**, Atlas 봇 = **관측(observation)**. **두 봇을 같은 채널에 두지 않는다.** pm-discord-hub는 현재 미설정이므로 **되살릴지 여부 자체가 열린 결정**이고, 되살리지 않으면 이 겹침은 사라진다.

**겹침 ② 프로필을 공유하면 RPA와 봇이 서로를 밟는다**

Discord 토큰은 안 겹친다(§Q5-e). 겹치는 건 이것들이다:

| 자원 | 공유 시 무슨 일이 나는가 |
|---|---|
| `cron/jobs.json` | 봇 스케줄 추가 시 RPA 잡과 같은 파일 편집 — 실수로 지울 위험 |
| `sessions/`, `state.db` | 대화 세션과 RPA 기록이 한 DB에 (이미 44MB) |
| `memories/MEMORY.md` | **가장 위험.** 봇이 대화에서 얻은 것이 RPA 판단에 샌다 (역도 성립) |
| `terminal.cwd`, `toolsets` | §Q6에서 좁혀야 할 값들이 **전역**이다. RPA 쪽 동작을 바꾸게 된다 |
| gateway 프로세스 | 재시작·크래시가 **양쪽 모두**에 영향 |

**§Q6에서 밝혀진 네 번째 항목이 결정적이다.** BangCheck 봇을 위해 `terminal.cwd`를 저장소로 고정하고 toolset을 좁히면, 같은 프로필의 RPA 잡도 그 설정을 받는다. **프로필을 나누지 않으면 봇을 안전하게 만드는 행위 자체가 RPA를 망가뜨린다.**

---

## 4. 읽기/쓰기 경계 — 이 설계의 핵심

### 4.1 정면으로 다뤄야 할 충돌

두 기존 계획 문서가 서로 다른 것을 말한다.

| 문서 | 쓰기에 대한 입장 |
|---|---|
| `2026-07-27_133043-...role-chatbot.md` §MVP 범위 5 | *"봇은 읽기·알림만 수행한다. Issue 생성·상태 변경·코드 실행·배포·PR 병합은 포함하지 않는다."* |
| 같은 문서 §수용 기준 | *"봇의 MVP 권한에는 GitHub/Discord 쓰기 변경 권한이 없다."* |
| `2026-07-27_134325-...pm-chat-document-ops-v0.md` §Architecture | *"PM의 명시 승인 뒤에만 Git branch/PR을 통해 문서 변경을 제안한다."* |
| 같은 문서 §V0 범위 In 5-6 | *"bot은 변경 전후 diff, 근거, 영향 문서를 보여 준다. PM의 명시 승인 후에만 Git branch와 PR을 만들어 문서 변경을 제안한다."* |

**즉 "읽기 전용"은 첫 번째 문서의 결정이고, 두 번째 문서는 이미 승인 기반 쓰기를 허용하고 있다.** 사용자가 원하는 Atlas 튜닝은 두 번째에 가깝다.

**임의로 한쪽을 택하지 않는다.** 선택지를 놓고 근거를 적는다.

### 4.2 선택지

**선택지 A — 완전 읽기 전용 (첫 문서 준수)**

봇은 빈칸을 말하기만 한다. 사용자가 "BC-SEC-01은 216이야"라고 답하면, 봇은 **적용할 명령어 한 줄을 출력**하고 사람이 터미널에서 실행한다.

- 장점: 가장 안전. 승인 피로 없음. §Q6의 sandbox 부재가 문제되지 않음. 계획 문서와 무충돌
- 단점: 대화의 이점이 절반 사라진다. 25건 결함 × 손 편집은 결국 안 하게 된다 — **빈칸이 남는 원인이 그대로 재현된다**

**선택지 B — 좁은 화이트리스트 쓰기 + 명시 승인 (권장)**

봇이 쓸 수 있는 필드를 **미리 열거된 목록으로 못 박고**, preview→승인→apply를 거친다.

- 장점: 사용자가 원한 것을 실제로 준다. 쓰기 표면이 **한 자릿수 필드**로 좁아 검증 가능
- 단점: 구현·검증 비용. 승인 UX 설계 필요
- **첫 문서와의 충돌:** 있다. 다만 첫 문서의 금지 대상은 *"Issue 생성·상태 변경·코드 실행·배포·PR 병합"* 이다. **`defects.yaml`의 `issue` 번호를 적는 것은 그중 어디에도 해당하지 않는다** — GitHub을 바꾸는 게 아니라 이미 존재하는 이슈 번호를 로컬 레지스트리에 기록하는 것이다. 좁게 해석하면 충돌이 아니다. **그래도 이 해석은 사용자 승인을 받아야 한다.**

**선택지 C — 문서 ops v0 방식: 브랜치/PR로만 쓰기**

봇이 직접 파일을 고치지 않고 **브랜치를 만들어 PR을 연다.**

- 장점: 되돌리기가 공짜. 리뷰 가능. 두 번째 계획 문서와 정확히 일치
- 단점: 필드 하나 채우는 데 PR이 열린다 — 25건이면 PR 폭탄. `git push` 권한이 필요해 **오히려 권한이 넓어진다**

### 4.3 권장: 선택지 B, 단 쓰기 표면을 극단적으로 좁힌다

**근거는 스키마 자신이 준다.** `.project-atlas/schema.yaml:100-104`:

```yaml
  # 결함 생애주기에서 사람이 적는 값은 이것 하나다 (선택).
  # OBSERVED(이슈 없음) → TRACKED(이슈 등록) → IN_PROGRESS(PR 열림) → RESOLVED(머지됨)
  # 뒤의 셋은 이 번호에서 파생될 값이라 사람이 적지 않는다 — 두 곳에 적으면 갈라진다.
  issue:       { type: integer }
```

그리고 `pm_snapshot.py:75-80`:

```
사람이 적는 값은 defects.yaml의 `issue` 하나뿐이다. 나머지 셋은 그 번호에서
파생돼야 하는데 지금은 이슈↔PR을 읽어올 원천이 없다 — links.source가 null인 것과
같은 이유다. 그래서 여기서는 issue 유무까지만 답하고, PR·머지는 추측하지 않는다.
```

```python
return "TRACKED" if defect.get("issue") else "OBSERVED"
```

> **Atlas는 이미 "사람이 적는 값은 정확히 하나"라고 선언해 두었다. 봇의 쓰기 표면은 그 선언을 그대로 따르면 된다 — 정수 하나.**

**허용 쓰기 목록 (이것 외에는 금지)**

| # | 대상 | 값의 성격 | 검증 방법 |
|---|---|---|---|
| 1 | `defects.yaml` 각 항목의 `issue` | 정수 1개 | 사용자가 말한 번호 그대로. 봇이 계산하지 않음 |
| 2 | `FT-*.yaml`의 `tests` | 파일 경로 목록 | **파일이 실재해야** 함 (schema `type: filePath`) |
| 3 | 미등재 호출의 기능 등재 | `FT-*` id | 기존 registry에 있는 id여야 함 |
| 4 | `links.source` / `links.byFeature` 규약 | (미정) | **아직 규약이 없다** — §4.6 참조 |

1번이 가장 먼저다. 스키마가 명시적으로 허용했고, 값이 정수 하나이며, 25건 전부가 비어 있어 효과가 즉시 보인다.

### 4.4 `hermes_feed.py`의 원칙을 어떻게 지키는가

지켜야 할 문장(`hermes_feed.py:31-33`):

> *"Do not infer an Issue for automatic write. Create a preview JSON, validate it, and apply only when source=explicit and confidence=1.0."*

RPA 쪽은 이걸 **코드로** 구현해 뒀다. `projection_worker.py:4-5`:

```
The worker owns deterministic collection, validation and Linear writes. An LLM may
author a preview, but cannot bypass this policy gate.
```

`validate_preview()`(`projection_worker.py:249-269`)의 실제 규칙:

```python
if preview.get("source") not in {"explicit", "inferred"}: errors.append(...)
if preview.get("source") == "explicit":
    if preview.get("issue_id") not in job.get("explicit_issue_ids", []):
        errors.append("explicit preview issue must occur in the commit message")
    if preview.get("confidence") != 1.0:
        errors.append("explicit preview confidence must be 1.0")
```

그리고 정책(`references/projection-policy.md`):

> `자동 쓰기는 source=explicit, confidence=1.0만 허용한다.`
> `모델 추론은 source=inferred로 기록한다. 추론된 이슈에는 자동으로 쓰지 않는다.`

**Atlas 봇에 그대로 이식한다. 핵심은 "검증기가 모델 바깥에 있다"는 것이다.**

| 상황 | `source` | `confidence` | 결과 |
|---|---|---|---|
| 사용자가 "BC-SEC-01은 이슈 216이야"라고 **말했다** | `explicit` | `1.0` | ✅ apply 가능 |
| 봇이 제목 유사도로 "아마 #216일 것" | `inferred` | `<1.0` | ❌ **금지.** `needs-review`로 남긴다 |
| 사용자가 "216쯤이었나?" 라고 흐리게 말했다 | `inferred` | `<1.0` | ❌ 금지. 되물어야 한다 |
| 사용자가 존재하지 않는 결함 id를 말했다 | — | — | ❌ 검증 실패 (id는 `^BC-[A-Z]+-[0-9]{2}$`, `schema.yaml:38`) |

**결정적 설계 규칙: 이 검증을 모델에게 시키지 않는다.** 모델은 preview JSON을 쓰기만 하고, **모델이 아닌 스크립트**가 검증하고 적용한다. 모델이 "확신한다"고 말해도 스크립트가 `source: explicit`과 `confidence: 1.0`을 확인하지 못하면 apply는 일어나지 않는다.

**§Q6이 밝혀낸 사실 때문에 이 방식은 선택이 아니라 유일한 안전 경로다.**

정리하면 이렇다:

| 경로 | 승인 게이트 | 판정 |
|---|---|---|
| 봇이 `write_file`/`patch`로 `defects.yaml`을 직접 수정 | **없음** (§Q6-a) | ❌ **절대 허용 불가.** 봇이 조용히 아무 파일이나 고칠 수 있다 |
| 봇이 `terminal`로 `atlas_apply.py`를 실행 | ✅ 있음 — Discord 4버튼 (§Q6-c) | ✅ **이 경로만 쓴다** |

따라서 2단계 설정의 핵심은 **`file` toolset을 프로필에서 제거하는 것**이다. 도구가 없으면 우회할 방법도 없다. 그러면:

1. 봇은 `read_file`/`search_files`가 없어도 된다 — Atlas 조회는 전용 조회 스크립트로 한다 (또는 읽기 전용이므로 `file` 대신 좁은 읽기 스킬을 준다)
2. 쓰기는 `terminal`을 통한 `atlas_apply.py --preview <파일>` 호출 **하나뿐**이다
3. 그 호출이 승인 게이트를 타므로 Discord에 버튼이 뜬다
4. 승인이 나도 스크립트 내부 검증(`source=explicit`, `confidence=1.0`, 화이트리스트)을 또 통과해야 한다

**이중 게이트다: 사람의 승인(누가) + 스크립트의 검증(무엇을).** 어느 하나만으로는 부족하다 — 승인 피로가 쌓이면 사람은 누르고, 스크립트만 있으면 언제 도는지 통제가 안 된다.

⚠️ **주의:** `command_allowlist`(§Q6-e)에 `atlas_apply.py` 패턴을 추가하면 승인이 사라진다. **추가하지 않는다.** "Always Allow" 버튼도 같은 효과이므로, 운영 규칙으로 금지하고 `SOUL.md`에 적는다.

### 4.5 Discord 대화에서 실제로 어떻게 보이는가

```
[cron 다이제스트 — 사람 없이 자동, 쓰기 없음]

📊 Atlas 빈칸 리포트 (2026-08-05 09:00)
  결함 25건 중 이슈 미등록 25건 (P1 4 / P2 13 / P3 8)
  기능 19개 중 테스트 미기재 19개
  links.byFeature 비어 있음 (연결 규약 미정)
  ⚠️ project.yaml의 repo가 실제 remote와 다릅니다: BangCheck/BangCheck ≠ SWYP-Backend/BangCheck

  근거: .project-atlas/registry/, atlas-snapshot.json (수집 09:00:03)
```

```
[사람이 있는 대화 — 여기서만 쓰기가 일어난다]

사용자:  @AtlasBot P1 결함 4개만 보여줘

봇:  확인됨 · 수집 2026-08-05 09:12
     P1 결함 4건, 전부 lifecycle=OBSERVED (이슈 없음)

     1. BC-SEC-01  고아 엔드포인트가 방 소유권을 검증하지 않는다
        disposition: UNDECIDED
        근거: backend/.../RoomController.java:92 (saveCheckResults)
        관련 기능: FT-ROOM-CREATE-WITH-CHECKLIST
     2. ...

사용자:  BC-SEC-01은 이슈 216이야

봇:  📝 적용 preview — 확인해 주세요

     파일:   .project-atlas/registry/defects.yaml
     대상:   BC-SEC-01
     변경:   + issue: 216
     파생:   lifecycle  OBSERVED → TRACKED   (pm_snapshot.py:80이 재계산)

     source:     explicit      ← 사용자 발화에서 직접 옴
     confidence: 1.0
     검증:       ✅ id BC-SEC-01 존재 · ✅ 216 정수 · ✅ issue 필드는 화이트리스트

     ⚠️ 이슈 216이 SWYP-Backend/BangCheck에 실재하는지는 확인하지 못했습니다
        (links.source 미설정 — GitHub 조회 원천이 없습니다)

     [Allow Once]  [Allow Session]  [Always Allow]  [Deny]
     ← Discord exec 승인 버튼 (plugins/platforms/discord/adapter.py:5798-5890)
       ⚠️ Allow Session / Always Allow 는 누르지 않는다 — 이후 apply가 무승인이 된다

사용자:  [Allow Once]

봇:  ✅ 적용됨
     defects.yaml 1줄 변경. 스냅샷 재생성 완료.
     남은 이슈 미등록 결함: 24건
```

**흐름의 불변식**

1. **preview 없이 apply 없다.** 봇이 파일을 먼저 고치고 사후 보고하는 경로는 만들지 않는다 — **`file` toolset을 빼서 그 경로를 물리적으로 없앤다** (§Q6-h)
2. **승인은 Discord 버튼 또는 `/approve` 답장.** 게이트웨이 승인 타임아웃은 **`approvals.gateway_timeout` 기본 300초**(`tools/approval.py:1464-1469`)다 — CLI용 `approvals.timeout: 60`(`config.yaml:570`)과 다른 값이니 혼동하지 않는다. 무응답은 **취소**이지 승인이 아니다
3. **cron 턴에서는 이 흐름이 아예 시작되지 않는다.** cron은 gateway 승인 컨텍스트에서 구조적으로 배제되고(`tools/approval.py:143-152`) `approvals.cron_mode: deny`(`config.yaml:571`)로 떨어진다. 게다가 다이제스트 잡은 `no_agent: true`라 LLM 자체가 없다
4. **파생값은 봇이 안 적는다.** `lifecycle`은 `issue`에서 계산된다. 봇이 `TRACKED`를 직접 쓰면 스키마 주석이 경고한 *"두 곳에 적으면 갈라진다"* 가 그대로 발생한다
5. **모르는 것은 모른다고 말한다.** 위 예시의 "216이 실재하는지 확인 못 함" 경고가 그것이다

### 4.6 아직 규약이 없어서 이번에 정할 수 없는 것

`links.byFeature`는 **채우기 전에 규약부터 만들어야 한다.** `pm_snapshot.py:199-201`이 비워 둔 이유가 *"연결 규약이 아직 없다"* 이다. 규약 없이 채우면 다음 생성 때 지워지거나(하드코딩된 `{}`가 덮어씀), 형식이 갈린다.

**순서:** ① `project.yaml`의 repo 수정 → ② `links.source` 규약 확정(어디서 Issue/PR을 읽을 것인가) → ③ `pm_snapshot.py`가 `byFeature`를 실제로 계산하도록 수정 → ④ 그 다음에야 봇이 관여.

**이번 1단계에서는 ①만 준비 상태로 두고, ②~④는 2단계 이후다.** 봇이 `atlas-snapshot.json`을 직접 편집하게 해서는 **절대 안 된다** — 그 파일은 생성물이고(`pm_snapshot.py:195-197`: *"손으로 고치지 말라는 표시. 고쳐도 다음 생성에서 지워진다"*), 정본은 `.project-atlas/registry/`다.

---

## 5. 권장 구성

### 5.1 결론

> **전용 Hermes 프로필 `bangcheck`를 만들고, 그 프로필의 gateway를 별도 launchd 서비스로 돌린다. 새 Discord Application/토큰을 발급해 그 프로필에만 넣는다. 기존 `default` 프로필과 woo-linear RPA는 손대지 않는다.**

```
~/HermesHome/                       ← default 프로필 (root)
  config.yaml, .env                 기존 Discord 토큰(무효), terminal.cwd: .
                                    command_allowlist에 'recursive delete' 있음 ⚠️
  cron/jobs.json                    RPA commit→Linear 잡 (건드리지 않음)
  scripts/rpa_linear_projection.sh  기존 RPA 스크립트 (건드리지 않음)
  → launchd: ai.hermes.gateway.plist              (PID 50517, 현행 유지)

~/HermesHome/profiles/bangcheck/    ← 신규, 격리됨
  config.yaml
    terminal.cwd: <BangCheck 저장소 절대경로>       ← §Q6(g). sentinel '.' 금지
    platform_toolsets.discord: [terminal, skills, todo, clarify]
                                                   ← §Q6(h). file 제거가 핵심
    approvals.mode: manual                         유지. smart/off 금지
    approvals.cron_mode: deny                      유지
    command_allowlist: []                          ← 비운다. default 것을 물려받지 않음
    discord.allowed_channels: <테스트 채널 id>      ← 현재 default는 '' (무제한)
    discord.require_mention: true
  .env                              신규 DISCORD_BOT_TOKEN + DISCORD_HOME_CHANNEL
  SOUL.md                           §4.5의 불변식 5개를 명문화
  skills/                           Atlas 조회 스킬
  scripts/                          atlas_apply.py, atlas_gap_report.sh  ← §Q7(d)
  cron/                             빈칸 다이제스트 (no_agent, deliver: discord:<채널>)
  sessions/, memories/, state.db    완전 분리
  → launchd: ai.hermes.gateway-bangcheck.plist    (별도 프로세스)
```

### 5.2 왜 이 구성인가

1. **Q4의 락이 문제되지 않는다.** 토큰이 다르므로 충돌 없음
2. **Q3의 격리가 정확히 필요한 격리다.** cron·sessions·memories·state가 갈라져, 봇의 대화가 RPA 판단에 새어 들지 않는다
3. **§3.3 겹침 ②가 결정적이다.** §Q6에서 좁혀야 할 값(`platform_toolsets.discord`, `terminal.cwd`, `command_allowlist`)이 전부 **프로필 전역**이다. 프로필을 나누지 않으면 **봇을 안전하게 만드는 행위가 곧 RPA를 망가뜨린다.** 특히 `command_allowlist`를 비우는 조치는 default 프로필에서 하면 기존 워크플로를 깨뜨린다. 이것만으로 분리 근거가 충분하다
3-1. **default 프로필의 현재 상태가 봇을 받기에 부적합하다.** `command_allowlist`에 `recursive delete`가 사전 승인돼 있고(§Q6-e), `discord.allowed_channels`가 비어 무제한이며(§Q6-b), Discord toolset에 `file`·`code_execution`·`computer_use`가 전부 켜져 있다. **여기에 대화 봇을 붙이는 것은 위험하다**
4. **재시작 독립성.** `hermes -p bangcheck gateway restart`가 RPA를 안 건드린다
5. **`multiplex_profiles`를 안 쓰는 이유:** §Q1(d)의 미확인 두 가지(부차 프로필 토큰 공급 경로, `DISCORD_*` 설정의 프로필별 스코프)가 리스크다. 실측 전에 단정하지 않는다는 규율에 따라 검증되지 않은 경로에 운영을 걸지 않는다
6. **기존 계획 문서와 무충돌.** *"한 개의 봇 프로세스가 PM/Frontend/Backend 관점을 필터링해 말하게 하며, 세 개의 독립 에이전트가 서로 다른 사실을 만드는 구조는 만들지 않는다"* — **그대로 지켜진다.** 프로필 하나 = 봇 프로세스 하나 = 관점 셋. **역할별로 프로필을 나누지 않는다.**

### 5.3 솔직한 트레이드오프

| | 프로필 분리 (권장) | 단일 프로필 통합 | `multiplex_profiles` |
|---|---|---|---|
| RPA와의 격리 | ✅ 완전 | ❌ 없음 | ⚠️ 부분(설정 공유 의심) |
| **cwd·toolset을 봇만 좁히기** | ✅ 가능 | ❌ **불가 — RPA도 영향** | ⚠️ 불명 |
| 재시작 독립성 | ✅ | ❌ | ❌ (한 프로세스) |
| 프로세스 비용 | ❌ gateway 2개 | ✅ 1개 | ✅ 1개 |
| 설정 관리 | ❌ config·.env 2벌 | ✅ 1벌 | ⚠️ 1.5벌 |
| 검증 수준 | ✅ 코드·CLI로 확인 완료 | ✅ | ❌ **미검증 경로 존재** |

**분리의 실제 비용은 "프로세스 하나 추가 + 설정 두 벌 관리"다.** 이 머신은 이미 프로필별 plist를 1급 지원하므로(`gateway.py:2395-2398`) 운영 부담은 낮다.

**다만 정직하게:** §1의 split-brain(`~/.hermes` vs `~/HermesHome`)이 정리되지 않은 채 프로필을 얹으면 **경로 혼동이 세 갈래가 된다.** 프로필 생성 전에 split-brain을 먼저 정리하는 편이 낫다는 견해도 성립한다. 사용자 결정 사항이다.

### 5.4 Hermes를 쓰는 것 자체에 대한 유보

기존 계획 문서는 **독립 TypeScript 서비스**(`automation/discord-bot/`)를 전제한다. 이번 요구는 **런타임 변경**이다. 데이터 계약·MVP 범위·안전 규칙은 런타임과 무관하게 유효하므로 충돌은 아니지만, 다음은 명시적으로 뒤집힌다:

- 계획서 Task 5 Step 3은 *"LLM 도입 전에는 키워드·옵션 기반 parser로 운영"* 을 권고했다. Hermes를 쓰면 **LLM이 처음부터 앞단에 선다.**
- 따라서 §4.4의 "검증기를 모델 바깥에 둔다"가 **선택이 아니라 필수**가 된다. 이것이 없으면 계획서의 안전 규칙 전부가 모델의 선의에 의존하게 된다.

---

## 6. 사용자가 해야 할 일 (사람만 할 수 있는 단계)

순서대로. **이 중 어느 것도 이번 단계에서 대신 수행하지 않았다.**

### 단계 A — 결정 (코드 이전)

1. **§4.2의 선택지 A/B/C 중 하나를 고른다.** 이 문서는 B(좁은 화이트리스트 + 명시 승인)를 권하지만, 기존 계획 문서의 "읽기 전용" 결정을 뒤집는 것이므로 **사용자 승인이 필요하다.**
2. **§1의 split-brain을 어떻게 할지 정한다.** `~/HermesHome`으로 통일 / `~/.hermes`로 복귀 / 그대로 두고 규칙화.
3. **`~/HermesHome/.env`의 무효 Discord 토큰 처리.** 지금 5분마다 401을 찍는다. (a) 새 토큰 교체 (b) 항목 제거해 어댑터 비활성화 (c) 방치.
4. **pm-discord-hub를 되살릴지 정한다.** 되살린다면 §3.3 겹침 ①의 채널 분리 규칙도 함께.
5. **`.project-atlas/project.yaml`의 `repo`를 `SWYP-Backend/BangCheck`로 고칠지 확인한다** (§0.2). `.project-atlas/`는 보호 파일 목록에 없으나 Atlas 소유이므로 확인 후 진행한다.
6. **`atlas-snapshot.json`의 git 취급을 정한다** — `.gitignore`에 넣을지, 커밋할지 (§Q7-f).

### 단계 B — Discord Developer Portal (사용자만 가능)

7. https://discord.com/developers/applications 에서 **새 Application을 만든다.** 기존 것을 재사용하지 않는다 (§Q4 — 토큰 재사용은 두 번째 프로세스를 즉시 죽인다).
8. Bot 탭에서 **Bot User 추가**, 토큰 발급. 토큰은 **한 번만 보여진다.**
9. **⚠️ Bot 탭 → Privileged Gateway Intents 에서 `MESSAGE CONTENT INTENT`를 켠다.**
   빠뜨리면 §Q5(b)에서 확인한 2026-07-21의 `PrivilegedIntentsRequired` 실패가 **그대로 재현된다.**
   (`SERVER MEMBERS INTENT`는 역할 기반 권한을 쓸 때만.)
10. OAuth2 → URL Generator: scope `bot` + `applications.commands`.
    권한은 최소로 — `View Channels`, `Send Messages`, `Send Messages in Threads`, `Create Public Threads`, `Read Message History`, `Embed Links`.
    **`Manage Messages`·`Manage Channels`·`Administrator`는 주지 않는다.**
    (승인 버튼은 봇 자신의 메시지에 붙으므로 추가 권한이 필요 없다.)
11. 초대 URL로 봇을 서버에 넣되, **테스트 채널에만** 접근 가능하도록 채널 권한을 좁힌다.

### 단계 C — 기존 웹훅 정리

12. **대화에 노출된 Incoming Webhook을 삭제·재발급한다.** 새 URL은 이 문서·저장소·채팅 어디에도 적지 않는다. 웹훅은 알림 전용으로만 남긴다 (§3.1).

### 단계 D — 토큰 전달

13. 토큰을 **채팅·문서·커밋에 붙여넣지 않는다.**
14. 2단계에서 프로필이 만들어진 뒤 사용자가 직접 넣는다:
    - `HERMES_HOME=/Users/woojongho/HermesHome hermes -p bangcheck gateway setup` (대화형)
    - 또는 `~/HermesHome/profiles/bangcheck/.env` 에 직접 추가 (권한 600 확인)
15. **GitHub 읽기 토큰**도 필요하다 (`links.source` 규약을 만들 때): fine-grained PAT, `Issues: read` + `Pull requests: read` **만.** 쓰기 없음.

### 단계 E — 승인이 필요한 지점

16. 2단계에서 다음 전에 승인을 받는다: 프로필 생성, launchd 서비스 설치, `.project-atlas/` 파일 수정, `~/HermesHome/config.yaml` 수정.

---

## 7. 다음 단계 (2단계에서 할 일)

우선순위 순.

**2-0. 선결 — Atlas 쪽 정합 (봇과 무관하게 지금 맞는 일)**
- `.project-atlas/project.yaml`의 `repo`를 `SWYP-Backend/BangCheck`로 수정 (§0.2). 이게 틀린 채로는 어떤 링크도 성립하지 않는다
- `workingBranch: v0.2.0` ↔ 현재 브랜치 `atlas/baseline` 불일치 확인
- `atlas-snapshot.json`·`pm_snapshot.py`의 git 취급 확정

**2-1. 프로필 골격 (승인 후)**
```bash
HERMES_HOME=/Users/woojongho/HermesHome \
  hermes profile create bangcheck --description "BangCheck Atlas 빈칸 튜닝 봇"
```
- **`--clone` / `--clone-all`을 쓰지 않는다.** 이유가 셋이다: ① default의 무효 Discord 토큰이 딸려 온다 ② `command_allowlist`의 `recursive delete` 사전 승인을 물려받는다(§Q6-e) ③ `platform_toolsets.discord`의 넓은 도구 목록을 물려받는다
- 생성 후 `~/HermesHome/profiles/bangcheck/`에 실제로 생겼는지, `~/.hermes` 쪽에 잘못 생기지 않았는지 **경로를 확인**한다 (§1의 함정)

**2-2. 안전 경계 강제 — 가장 중요**
- **`platform_toolsets.discord`에서 `file`을 제거한다.** §Q6이 밝힌 대로 `write_file`/`patch`는 승인을 안 타므로, **도구 자체를 빼는 것 말고는 막을 방법이 없다.** `code_execution`, `computer_use`, `browser`, `delegation`도 함께 뺀다
- `terminal.cwd`를 BangCheck 저장소 절대경로로 **명시 고정** (§Q6-g). 안 하면 `$HOME`에서 돈다. sentinel(`.`, `auto`, `cwd`)은 무효
- `command_allowlist`를 **비운다.** default의 `recursive delete` 사전 승인을 물려받으면 안 된다 (§Q6-e)
- `approvals.mode: manual` 유지. **`smart`·`off`로 바꾸지 않는다** (§Q6-d)
- `discord.allowed_channels`를 테스트 채널 하나로 제한 (현재 default는 `''` = 무제한), `require_mention: true`
- `SOUL.md`에 §4.5의 불변식 5개 + "Always Allow 버튼 금지"를 명문화
- **검증 — 주장이 아니라 실행으로:**
  1. 채널에서 저장소 밖 파일 쓰기를 시켜 본다 → **도구 부재로 거부**되어야 한다
  2. 임의 셸 명령을 시켜 본다 → **승인 버튼이 떠야** 한다
  3. `atlas_apply.py`를 화이트리스트 밖 필드로 호출해 본다 → **스크립트가 거부**해야 한다

**2-3. 읽기 경로 먼저 — 쓰기는 그 다음**
- Atlas 조회 스킬: `defects.yaml`·`FT-*.yaml`·`atlas-snapshot.json`을 읽어 빈칸을 답한다
- 모든 답변에 근거(파일·심볼·줄)와 수집 시각. 계획서 §응답 안전 규칙 준수
- **읽기가 신뢰를 얻기 전에 쓰기를 붙이지 않는다**

**2-4. 쓰기 게이트 — 모델 바깥의 검증기**
- `atlas_apply.py` (가칭): preview JSON을 받아 검증하고 적용하는 **좁은 스크립트**
- `projection_worker.py:249-269`의 `validate_preview()`를 본떠 구현:
  화이트리스트 필드인가 / `source == "explicit"` 인가 / `confidence == 1.0` 인가 / id가 실재하는가 / 타입이 맞는가
- **실패 테스트를 먼저 쓴다:** 추론된 값 거부, 화이트리스트 밖 필드 거부, 존재하지 않는 결함 id 거부, `lifecycle` 직접 쓰기 거부, 저장소 밖 경로 거부
- 스크립트는 `~/HermesHome/profiles/bangcheck/scripts/`에 둔다 (cron에서도 재사용하려면 이 위치여야 한다 — §Q7-d)
- 봇에게는 이 스크립트만 준다. **범용 편집 도구(`file` toolset)를 주지 않는다** — 2-2에서 이미 제거했으므로 자동으로 성립한다
- 적용 후에는 `pm_snapshot.py`를 재실행해 파생값(`lifecycle`)이 다시 계산되게 한다. 봇이 파생값을 손으로 적지 않는다

**2-5. 대화 흐름 연결**
- §4.5의 preview → Discord 버튼 → apply. 승인 타임아웃은 `approvals.gateway_timeout`(기본 300초)이며, 무응답은 **취소**로 처리한다
- 첫 대상은 `defects.yaml`의 `issue` 필드 하나 (§4.3)

**2-6. 주기 다이제스트**
- cron 잡: `no_agent: true` + `script` + `deliver: discord:<채널id>` (§Q7-b)
- **달라진 게 없으면 아무것도 보내지 않는다** — `hermes_feed.py`와 같은 원칙
- 스크립트는 `~/HermesHome/profiles/bangcheck/scripts/`에 둔다 — 그 밖은 실행이 거부된다 (§Q7-d)
- **`no_agent: true`가 진짜 안전장치다.** `approvals.cron_mode: deny`는 셸 명령만 막고 파일 쓰기는 못 막는다(§Q7-c). LLM을 아예 안 돌려 도구를 없애는 쪽이 확실하다

**2-7. 회귀 확인**
- **RPA 잡 `e1553c343c6c`가 여전히 2분마다 `last_status: ok`인지 확인한다.** 이것이 "무관하게 돈다"의 실제 증거다
- default gateway(PID 50517)가 영향받지 않았는지 확인

### 2단계에서 명시적으로 하지 않을 것

- 역할별로 프로필/에이전트를 나누는 것 (계획서가 금지)
- `atlas-snapshot.json`을 봇이 직접 편집하는 것 (생성물이다 — §4.6)
- `links.byFeature`를 규약 없이 채우는 것 (§4.6)
- 봇이 GitHub Issue를 생성·수정하는 것 (계획서 비범위, 이번 쓰기 화이트리스트에도 없음)
- `default` 프로필의 config·cron·토큰 수정 (별도 승인 없이는)
- split-brain 정리 (사용자 결정 전)

---

## 부록 A: 근거 파일 목록

**Hermes 런타임**

| 주제 | 경로:줄 |
|---|---|
| HERMES_HOME 해석 | `~/.hermes/hermes-agent/hermes_constants.py:58,75,113-150` |
| 프로필 CLI | `hermes_cli/subcommands/profile.py:17-80` |
| 프로필 선파싱 | `hermes_cli/main.py:336-464` |
| 프로필별 분리 대상 | `hermes_cli/profiles.py:39-125` |
| 프로필별 launchd | `hermes_cli/gateway.py:2395-2398,3397` |
| PlatformConfig.token | `gateway/config.py:319-323,373` |
| platforms dict | `gateway/config.py:502,663-669,965-966` |
| Discord 토큰 env 경로 | `gateway/config.py:1269-1273` |
| 어댑터 1개/플랫폼 | `gateway/run.py:2580,6041,6080` |
| multiplex_profiles | `gateway/config.py:541,702-707`; `gateway/run.py:2586,7418-7550,7515-7528` |
| 멀티프로필 공식 문서 | `website/docs/user-guide/multi-profile-gateways.md:158-165` |
| 토큰 락 획득 | `plugins/platforms/discord/adapter.py:905` |
| 락 구현·실패 처리 | `gateway/platforms/base.py:2540-2558` |
| 락 경로·stale 판정 | `gateway/status.py:64-70,108-109,882-942` |
| **파일 도구 4종 정의** | `toolsets.py:40,189-193`; `tools/file_tools.py:1329(write),1412(patch)` |
| **파일 쓰기에 승인 없음 (게이트 진입점 2개뿐)** | `tools/approval.py:1409-1423`; `tools/file_tools.py:395,440`(주석뿐) |
| ACP만의 예외 | `model_tools.py:1090-1102` |
| **Discord toolset에 file 포함** | `toolsets.py:451-458`; `~/HermesHome/config.yaml:699-760` |
| 쓰기 거부 목록 (화이트리스트 아님) | `tools/file_tools.py:396-400,440-448`; `tools/file_operations.py:50-52` |
| "보안 경계가 아니다" 명시 | `tools/file_tools.py:517-519` |
| **OS sandbox 부재** | seatbelt/landlock/bubblewrap 소스 전역 검색 0건 |
| exec 승인 강제 활성화 | `gateway/run.py:1703` |
| **Discord exec 승인 4버튼** | `plugins/platforms/discord/adapter.py:4693-4738,5798-5890` |
| 승인 알림 등록·라우팅 | `gateway/run.py:16535-16620,16736` |
| 슬래시 확인 3버튼 (별개 흐름) | `gateway/run.py:12563-12570` |
| 승인 모드 유효값 | `tools/approval.py:1121-1122,1563,1672`; `hermes_cli/config.py:2320-2341` |
| YOLO 동결 | `tools/approval.py:29-32` |
| **cron은 gateway 승인에서 배제** | `tools/approval.py:143-152,1319-1330` |
| **TERMINAL_CWD 폴백** | `gateway/run.py:1710-1713`; `tools/file_tools.py:264-268,285` |
| 채널별 스킬 바인딩 (workdir는 불가) | `gateway/platforms/base.py:1991-2011,2014-2060` |
| cron 잡 스키마 | `cron/jobs.py:850-1015`, workdir 검증 `:714-745`, no_agent 요구 `:944-949` |
| cron deliver 계약 | `cron/scheduler.py:813-891,900-917,942-971` |
| **cron 스크립트 경로 봉인** | `cron/scheduler.py:1548-1630,1583-1598`; `tools/cronjob_tools.py:448-470` |
| cron 스킬 강제 선주입 | `cron/scheduler.py:1697-1896` |
| ⚠️ `command_allowlist`에 recursive delete | `~/HermesHome/config.yaml:574-576` |
| state.db / kanban.db 경로 | `hermes_state.py:121`; `hermes_cli/kanban_db.py:477-499` |
| 라이브 gateway 설정 | `~/Library/LaunchAgents/ai.hermes.gateway.plist` |
| 라이브 config (승인/터미널/toolset) | `~/HermesHome/config.yaml:16,80-104,463,523-550,568-573` |
| 라이브 Discord 실패 로그 | `~/HermesHome/logs/gateway.log` (2026-08-04 22:23) |
| 과거 intents 실패 로그 | `~/.hermes/logs/gateway.log` (2026-07-21 13:12) |
| cron 잡 상태 | `~/HermesHome/cron/jobs.json` |

**BangCheck Atlas**

| 주제 | 경로:줄 |
|---|---|
| 결함 스키마 — `issue`가 유일한 인간 입력값 | `.project-atlas/schema.yaml:95-104` |
| id 패턴 (feature/operation/defect) | `.project-atlas/schema.yaml:34-38` |
| feature 엔티티 계약 | `.project-atlas/schema.yaml:42-56` |
| authorityClass (AUTHORED/DERIVED/SEED) | `.project-atlas/schema.yaml:19-23` |
| AD-12 (별도 저장소 추출 예정) | `.project-atlas/schema.yaml:6-14`; `project.yaml` |
| **repo 값 오류** | `.project-atlas/project.yaml` (`BangCheck/BangCheck`) vs 실제 remote |
| lifecycle 파생 로직 | `.project-atlas/tools/pm_snapshot.py:70-80` |
| `__unmapped__` 버킷 | `.project-atlas/tools/pm_snapshot.py:142-155` |
| **`links` 하드코딩 빈 값 + "Hermes가 채울 자리"** | `.project-atlas/tools/pm_snapshot.py:199-201` |
| **"Hermes가 갱신할 자리도 이 파일"** | `.project-atlas/tools/pm_snapshot.py:20` |
| 생성물 경고 | `.project-atlas/tools/pm_snapshot.py:195-197` |
| CLI / npm alias | `.project-atlas/tools/pm_snapshot.py:138-141`; `frontend/package.json:11` |
| `/project-map` (슬래시 명령이 아니라 프론트 라우트) | `frontend/src/lib/routes.ts:13-15` |

**기존 계약 문서**

| 주제 | 경로 |
|---|---|
| 역할별 상태 봇 계획 (읽기 전용 MVP) | `01_www/.hermes/plans/2026-07-27_133043-bangcheck-discord-role-chatbot.md` |
| PM 문서 ops v0 (승인 기반 쓰기 허용) | `01_www/.hermes/plans/2026-07-27_134325-bangcheck-pm-chat-document-ops-v0.md` |
| 명세→로드맵 파이프라인 ("제안만, 자동 동기화 없음") | `01_www/.hermes/plans/2026-07-27_134325-bangcheck-pm-spec-roadmap-unit-pipeline.md` |
| **preview 정책 게이트 (모델이 우회 불가)** | `01_www/skills/woo-rpa-commit-linear/scripts/projection_worker.py:4-5,249-269` |
| explicit/confidence 정책 | `01_www/skills/woo-rpa-commit-linear/references/projection-policy.md` |
| 토큰 없이 폴링, 필요할 때만 깨움 | `01_www/skills/woo-rpa-commit-linear/scripts/hermes_feed.py:29-36` |
| BangCheck 현재 컨텍스트 (repo, blockers) | `_wood/context/current.yaml` |

## 부록 B: 이번 조사에서 확인하지 못한 것

정직하게 남긴다. 2단계에서 실측으로 채워야 한다.

1. 멀티플렉싱 시 부차 프로필의 `DISCORD_BOT_TOKEN` 공급 경로 (`.env`가 통하는지) — §Q1(d)
2. 멀티플렉싱 시 `DISCORD_*` 동작 설정이 프로필별로 스코프되는지 — §Q1(d)
3. Discord **채널**을 특정 Hermes **프로필**에 묶을 수 있는지. 프로필 네임스페이스 세션 키(`gateway/session.py:671-688`)와 `SessionSource.profile`(`:118-121`)은 확인했으나 Discord 쪽 바인딩 메커니즘은 못 찾았다
4. `git commit`/`git push`가 `DANGEROUS_PATTERNS`(`tools/approval.py:227-450`)에 실제로 걸리는지 — 전체 목록을 열거하지 못했다. **§4 설계는 여기 의존하지 않는다**(쓰기가 `atlas_apply.py` 호출 하나로 좁혀지므로)
5. `auxiliary.approval`(`config.yaml:226-232`, `provider: auto`)이 `smart` 모드에서 실제로 자동 승인을 수행하는지 — **`mode: manual`을 유지하는 한 무관하다**
6. `cron.max_parallel_jobs`가 빈 값일 때의 기본값

**§Q6(a)의 발견으로 해소된 항목** — 이전 판에서 "확인 못 함"이라 적었던 두 가지는 확정됐다: 승인 모드 유효값은 `manual`/`smart`/`off`이고, **파일 쓰기는 어느 모드에서도 승인을 타지 않는다.** 이 발견 때문에 §4와 §5의 설계가 "승인으로 막는다"에서 "도구를 뺀다"로 바뀌었다.
