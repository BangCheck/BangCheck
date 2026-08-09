package com.room.backend.api.report.service;

import com.room.backend.api.report.dto.request.CompareRoomRequestDTO;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.ReportErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService 테스트")
class ReportServiceTest {

    @Mock private RoomRepository roomRepository;
    @Mock private ChecklistItemRepository checklistItemRepository;
    @Mock private RoomCheckResultRepository roomCheckResultRepository;
    @Mock private RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository;
    @Mock private ChecklistOptionRepository checklistOptionRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    @DisplayName("compareRooms - 알 수 없는 카테고리는 500이 아니라 400으로 나간다 (BC-RPT-04)")
    void testCompareRoomsUnknownCategory() {
        CompareRoomRequestDTO request = CompareRoomRequestDTO.builder()
                .roomIds(List.of(1L))
                .categories(List.of("NOT_A_REAL_CATEGORY"))
                .build();

        GeneralException ex = assertThrows(GeneralException.class,
                () -> reportService.compareRooms(request));

        assertEquals(ReportErrorCode.UNKNOWN_CATEGORY, ex.getErrorCode());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getErrorCode().getStatus());
    }
}
