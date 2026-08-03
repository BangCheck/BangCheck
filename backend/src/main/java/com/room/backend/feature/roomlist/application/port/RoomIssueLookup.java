package com.room.backend.feature.roomlist.application.port;

import com.room.backend.feature.roomlist.domain.IssueFlags;

/**
 * 방 하나의 문제 뱃지 조회 side-effect port.
 *
 * <p>[알려진 비효율] legacy는 방마다 이 조회를 한 번씩 수행하고, 그 안에서 다시 답변·항목·선택지를
 * 건건이 조회한다. 결함 BC-LIST-03(N+1)으로 등록했으며 이 리팩토링에서 쿼리 수를 바꾸지 않는다.
 */
public interface RoomIssueLookup {

    IssueFlags summarize(long roomId);
}
