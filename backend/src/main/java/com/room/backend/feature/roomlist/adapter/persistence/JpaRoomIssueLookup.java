package com.room.backend.feature.roomlist.adapter.persistence;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.feature.roomlist.application.port.RoomIssueLookup;
import com.room.backend.feature.roomlist.domain.IssueFlags;
import com.room.backend.feature.roomlist.domain.IssueTopic;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * 기존 checklist repository에 위임하는 뱃지 조회 adapter.
 *
 * <p>[계약 보존] legacy {@code RoomCheckResultService.getRoomIssuesSummary}와 쿼리 순서·건수가 같다.
 * 다음 동작을 그대로 유지한다.
 * <ul>
 *   <li>항목을 찾지 못하거나 카테고리가 {@code PROBLEM}이 아니면 건너뛴다.</li>
 *   <li>선택지 중 하나라도 "{@value IssueTopic#NO_ISSUE_OPTION_VALUE}"가 아니면 문제 있음으로 본다.</li>
 *   <li>찾지 못한 선택지는 무시한다.</li>
 * </ul>
 *
 * <p>[알려진 비효율 BC-LIST-03] 답변마다 항목을 한 번, 선택지마다 다시 한 번 조회한다. 쿼리 수를
 * 줄이면 동작은 같아도 성능 특성이 달라지므로 이 리팩토링에서 바꾸지 않는다.
 */
public final class JpaRoomIssueLookup implements RoomIssueLookup {

    private final RoomCheckResultRepository roomCheckResultRepository;
    private final RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ChecklistOptionRepository checklistOptionRepository;

    public JpaRoomIssueLookup(
            RoomCheckResultRepository roomCheckResultRepository,
            RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository,
            ChecklistItemRepository checklistItemRepository,
            ChecklistOptionRepository checklistOptionRepository) {
        this.roomCheckResultRepository = roomCheckResultRepository;
        this.roomCheckSelectedOptionRepository = roomCheckSelectedOptionRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.checklistOptionRepository = checklistOptionRepository;
    }

    @Override
    public IssueFlags summarize(long roomId) {
        Map<String, Boolean> flagsByItemName = new HashMap<>();

        for (RoomCheckResult result : roomCheckResultRepository.findByRoomId(roomId)) {
            ChecklistItem item = checklistItemRepository.findById(result.getItemId()).orElse(null);
            if (item == null || item.getCategory() != ChecklistCategory.PROBLEM) {
                continue;
            }
            flagsByItemName.put(item.getItemName(), hasIssue(result.getId()));
        }

        return IssueFlags.fromItemNameFlags(flagsByItemName);
    }

    private boolean hasIssue(Long resultId) {
        return roomCheckSelectedOptionRepository.findByResultId(resultId).stream()
                .map(selected -> checklistOptionRepository.findById(selected.getOptionId()).orElse(null))
                .filter(Objects::nonNull)
                .anyMatch(option -> !IssueTopic.NO_ISSUE_OPTION_VALUE.equals(option.getOptionValue()));
    }
}
