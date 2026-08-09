package com.room.backend.api.room.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.room.backend.api.room.dto.response.RoomIssuesSummaryDTO;
import com.room.backend.api.room.dto.response.RoomIssueStatus;
import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.entity.enums.ChecklistIssueType;
import com.room.backend.domain.checklist.entity.enums.ItemType;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoomCheckResultService 테스트")
class RoomCheckResultServiceTest {

    @Mock
    private RoomCheckResultRepository roomCheckResultRepository;

    @Mock
    private RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository;

    @Mock
    private ChecklistOptionRepository checklistOptionRepository;

    @Mock
    private ChecklistItemRepository checklistItemRepository;

    @InjectMocks
    private RoomCheckResultService roomCheckResultService;

    @Test
    @DisplayName("방이 없으면 repository를 조회하지 않는다")
    void getRoomIssuesSummaries_emptyRooms_skipsRepositories() {
        Map<Long, RoomIssuesSummaryDTO> summaries = roomCheckResultService.getRoomIssuesSummaries(List.of());

        assertTrue(summaries.isEmpty());
        verify(roomCheckResultRepository, never()).findByRoomIdIn(List.of());
        verify(checklistItemRepository, never()).findAllById(List.of());
        verify(roomCheckSelectedOptionRepository, never()).findByResultIdIn(List.of());
        verify(checklistOptionRepository, never()).findAllById(List.of());
    }

    @Test
    @DisplayName("여러 방의 문제요소를 repository별 한 번의 배치 조회로 집계한다")
    void getRoomIssuesSummaries_multipleRooms_usesFixedBatchQueries() {
        RoomCheckResult moldResult = result(101L, 1L, 10L);
        RoomCheckResult leakResult = result(102L, 2L, 20L);

        ChecklistItem moldItem = ChecklistItem.builder()
            .id(10L)
            .itemName("변경된 곰팡이 표시명")
            .category(ChecklistCategory.PROBLEM)
            .issueType(ChecklistIssueType.MOLD)
            .itemType(ItemType.DEFAULT)
            .build();
        ChecklistItem leakItem = ChecklistItem.builder()
            .id(20L)
            .itemName("변경된 누수 표시명")
            .category(ChecklistCategory.PROBLEM)
            .issueType(ChecklistIssueType.LEAK)
            .itemType(ItemType.DEFAULT)
            .build();

        RoomCheckSelectedOption moldSelected = RoomCheckSelectedOption.create(101L, 1001L);
        RoomCheckSelectedOption leakSelected = RoomCheckSelectedOption.create(102L, 1002L);
        ChecklistOption moldOption = ChecklistOption.builder()
            .id(1001L)
            .checklistItemId(10L)
            .optionValue("있음")
            .build();
        ChecklistOption leakOption = ChecklistOption.builder()
            .id(1002L)
            .checklistItemId(20L)
            .optionValue("없음")
            .build();

        when(roomCheckResultRepository.findByRoomIdIn(List.of(1L, 2L)))
            .thenReturn(List.of(moldResult, leakResult));
        when(checklistItemRepository.findAllById(List.of(10L, 20L)))
            .thenReturn(List.of(moldItem, leakItem));
        when(roomCheckSelectedOptionRepository.findByResultIdIn(List.of(101L, 102L)))
            .thenReturn(List.of(moldSelected, leakSelected));
        when(checklistOptionRepository.findAllById(List.of(1001L, 1002L)))
            .thenReturn(List.of(moldOption, leakOption));

        Map<Long, RoomIssuesSummaryDTO> summaries =
            roomCheckResultService.getRoomIssuesSummaries(List.of(1L, 2L));

        assertEquals(RoomIssueStatus.PRESENT, summaries.get(1L).getMold());
        assertEquals(RoomIssueStatus.UNCHECKED, summaries.get(1L).getLeak());
        assertEquals(RoomIssueStatus.UNCHECKED, summaries.get(2L).getMold());
        assertEquals(RoomIssueStatus.NONE, summaries.get(2L).getLeak());

        verify(roomCheckResultRepository).findByRoomIdIn(List.of(1L, 2L));
        verify(checklistItemRepository).findAllById(List.of(10L, 20L));
        verify(roomCheckSelectedOptionRepository).findByResultIdIn(List.of(101L, 102L));
        verify(checklistOptionRepository).findAllById(List.of(1001L, 1002L));
        verify(roomCheckResultRepository, never()).findByRoomId(1L);
        verify(roomCheckSelectedOptionRepository, never()).findByResultId(101L);
        verify(checklistItemRepository, never()).findById(10L);
        verify(checklistOptionRepository, never()).findById(1001L);
    }

    @Test
    @DisplayName("문제 카테고리가 아닌 답변은 선택지 조회 대상에서 제외한다")
    void getRoomIssuesSummaries_nonProblemItem_skipsSelectedOptions() {
        RoomCheckResult result = mock(RoomCheckResult.class);
        when(result.getItemId()).thenReturn(10L);
        ChecklistItem item = ChecklistItem.builder()
            .id(10L)
            .itemName("채광")
            .category(ChecklistCategory.OPTION)
            .itemType(ItemType.DEFAULT)
            .build();

        when(roomCheckResultRepository.findByRoomIdIn(List.of(1L))).thenReturn(List.of(result));
        when(checklistItemRepository.findAllById(List.of(10L))).thenReturn(List.of(item));

        RoomIssuesSummaryDTO summary = roomCheckResultService.getRoomIssuesSummaries(List.of(1L)).get(1L);

        assertEquals(RoomIssueStatus.UNCHECKED, summary.getMold());
        assertEquals(RoomIssueStatus.UNCHECKED, summary.getLeak());
        verify(roomCheckSelectedOptionRepository, never()).findByResultIdIn(List.of(101L));
    }

    @Test
    @DisplayName("문제 항목에 선택한 옵션이 없으면 미확인으로 집계한다")
    void getRoomIssuesSummaries_noSelectedOption_returnsUnchecked() {
        RoomCheckResult result = result(101L, 1L, 10L);
        ChecklistItem item = ChecklistItem.builder()
            .id(10L)
            .itemName("곰팡이")
            .category(ChecklistCategory.PROBLEM)
            .issueType(ChecklistIssueType.MOLD)
            .itemType(ItemType.DEFAULT)
            .build();

        when(roomCheckResultRepository.findByRoomIdIn(List.of(1L))).thenReturn(List.of(result));
        when(checklistItemRepository.findAllById(List.of(10L))).thenReturn(List.of(item));
        when(roomCheckSelectedOptionRepository.findByResultIdIn(List.of(101L))).thenReturn(List.of());

        RoomIssuesSummaryDTO summary = roomCheckResultService.getRoomIssuesSummaries(List.of(1L)).get(1L);

        assertEquals(RoomIssueStatus.UNCHECKED, summary.getMold());
    }

    private RoomCheckResult result(Long resultId, Long roomId, Long itemId) {
        RoomCheckResult result = mock(RoomCheckResult.class);
        when(result.getId()).thenReturn(resultId);
        when(result.getRoomId()).thenReturn(roomId);
        when(result.getItemId()).thenReturn(itemId);
        return result;
    }
}
