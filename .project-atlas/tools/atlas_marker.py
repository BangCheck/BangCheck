#!/usr/bin/env python3
"""atlas-defect 마커의 계약을 단독으로 소유한다.

왜 모듈 하나로 뽑았는가
  마커 문자열이 두 곳에 있었다 — project_defects.py 가 만들고 sync_check.py 가
  읽었다. 둘이 각자 문자열을 들고 있으면 한쪽만 고칠 때 조용히 갈라지고,
  갈라진 것을 알아채는 자리가 없다. 이 조인 키가 어긋나면 registry 와 이슈의
  대조 전체가 무의미해진다.

무엇이 마커인가 — 계약
  **본문의 첫 비공백 줄이 정확히 마커 한 줄일 때만** 마커로 인정한다.

      <!-- atlas-defect: BC-AUTH-01 -->

  허용: 앞의 BOM, 줄 앞뒤 공백/탭, 마커 앞의 빈 줄, CRLF 개행
  불허: 그 줄에 마커 말고 다른 글자가 있는 것, 두 번째 줄 이후에 나오는 것

왜 "아무 데서나 찾기" 가 아니라 이 계약인가 (2026-08-07 실측)
  예전 구현은 본문 어디서든 `<!-- atlas-defect: ` 를 찾았다. 코드 스팬 안이든
  인용문 안이든 구별하지 않았다.

  그래서 **이 규약을 문서화하는 이슈가 그 자체로 CI 를 깼다.** 봇 안내문을
  인용하며 마커 문법을 백틱 안에 적었더니 파서가 진짜 마커로 읽었고,
  registry 에 없는 결함을 가리키는 고아 투영으로 잡혀 무관한 PR 이 떨어졌다
  (#262 · #261). 같은 사고가 그것을 고치는 과정에서 한 번 더 났다 —
  이번에는 파서 코드를 인용하다가.

  규약을 설명하는 글이 그 규약 때문에 못 써지면 그 규약은 틀렸다.

왜 첫 줄 그 자체가 아니라 "첫 비공백 줄" 인가
  마커가 본문 1행이라는 것은 현재 생성기(project_defects.py)의 성질이지
  사람이 편집한 이슈의 보장이 아니다. GitHub 웹 편집기·템플릿 삽입은 앞에
  빈 줄이나 BOM 을 남길 수 있다. 그 경우까지 "마커 없음" 으로 판정하면
  정상 투영을 못 읽는다 — 오탐을 잡으려다 미탐을 만든다.

  반대로 두 번째 줄 이후는 인정하지 않는다. 거기까지 열면 본문 어딘가의
  인용을 다시 마커로 읽게 되어 고치려던 것으로 되돌아간다.
"""

from __future__ import annotations

import re

# 생성 형식. project_defects.py 가 이슈 본문을 만들 때 쓴다.
FORMAT = "<!-- atlas-defect: {id} -->"

# 인식 형식. 줄 전체가 마커여야 한다 — `^...$` 앵커가 그 조건이다.
#   ﻿  BOM. GitHub 이 준 본문에 붙어 오는 경우가 있다
#   [^\S\n] 개행 아닌 공백류(스페이스·탭). splitlines 뒤라 개행은 없지만
#           CR 이 남는 경우를 함께 흡수한다
#   ID      `>` 를 포함할 수 없다. `-->` 와 모호해지기 때문이다
_MARKER_LINE = re.compile(
    r"^﻿?[^\S\n]*<!--[^\S\n]*atlas-defect:[^\S\n]*(?P<id>[^>\s][^>]*?)[^\S\n]*-->[^\S\n]*$"
)


def render(defect_id: str) -> str:
    """이슈 본문에 넣을 마커 한 줄."""
    return FORMAT.format(id=defect_id)


def marker_of(body: str | None) -> str | None:
    """본문에서 결함 ID 를 읽는다. 마커가 아니면 None.

    닫히지 않은 마커·깨진 형식에 예외를 내지 않는다 — 검사기가 예외로 죽으면
    '어긋남' 과 '검사기 버그' 를 구별할 수 없게 된다.
    """
    for line in (body or "").splitlines():
        if not line.strip():
            continue  # 마커 앞의 빈 줄은 허용한다
        matched = _MARKER_LINE.match(line)
        return matched.group("id").strip() if matched else None
    return None


def has_marker_for(body: str | None, defect_id: str) -> bool:
    """이 본문이 그 결함의 투영인가. 부분 문자열 대조를 대신한다."""
    return marker_of(body) == defect_id
