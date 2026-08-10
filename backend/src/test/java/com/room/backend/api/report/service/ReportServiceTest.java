package com.room.backend.api.report.service;

import com.room.backend.api.report.dto.request.CompareRoomRequestDTO;
import com.room.backend.api.report.dto.response.CompareRoomResponseDTO;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.room.entity.Room;
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

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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

    private static final Long USER_ID = 1L;

    @Test
    @DisplayName("compareRooms - 알 수 없는 카테고리는 500이 아니라 400으로 나간다 (BC-RPT-04)")
    void testCompareRoomsUnknownCategory() {
        CompareRoomRequestDTO request = CompareRoomRequestDTO.builder()
                .roomIds(List.of(1L))
                .categories(List.of("NOT_A_REAL_CATEGORY"))
                .build();

        when(roomRepository.countByIdInAndUserIdAndIsDeletedFalse(any(Collection.class), eq(USER_ID)))
                .thenReturn(1L);

        GeneralException ex = assertThrows(GeneralException.class,
                () -> reportService.compareRooms(USER_ID, request));

        assertEquals(ReportErrorCode.UNKNOWN_CATEGORY, ex.getErrorCode());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getErrorCode().getStatus());
    }

    @Test
    @DisplayName("compareRooms - 타인 소유 방이 섞이면 403이 나간다 (BC-RPT-02)")
    void testCompareRoomsForbiddenRoomAccess() {
        CompareRoomRequestDTO request = CompareRoomRequestDTO.builder()
                .roomIds(List.of(1L, 2L, 999L))
                .categories(List.of("BASIC_INFO"))
                .build();

        when(roomRepository.countByIdInAndUserIdAndIsDeletedFalse(any(Collection.class), eq(USER_ID)))
                .thenReturn(2L);

        GeneralException ex = assertThrows(GeneralException.class,
                () -> reportService.compareRooms(USER_ID, request));

        assertEquals(ReportErrorCode.FORBIDDEN_ROOM_ACCESS, ex.getErrorCode());
        assertEquals(HttpStatus.FORBIDDEN, ex.getErrorCode().getStatus());
    }

    @Test
    @DisplayName("compareRooms - BASIC_INFO에 nullable enum/boolean이 섞여도 500 대신 정상 응답 (BC-RPT-03)")
    void testCompareRoomsBasicInfoNullableFieldsDoNotThrow() {
        Long roomId = 100L;
        CompareRoomRequestDTO request = CompareRoomRequestDTO.builder()
                .roomIds(List.of(roomId))
                .categories(List.of("BASIC_INFO"))
                .build();

        when(roomRepository.countByIdInAndUserIdAndIsDeletedFalse(any(Collection.class), eq(USER_ID)))
                .thenReturn(1L);

        Room room = mock(Room.class);
        lenient().when(room.getName()).thenReturn("테스트방");
        lenient().when(room.getAddress()).thenReturn("서울 어딘가");
        lenient().when(room.getRentType()).thenReturn(null);
        lenient().when(room.getHasLoan()).thenReturn(null);
        lenient().when(room.getCanRegisterAddress()).thenReturn(null);
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));

        CompareRoomResponseDTO res = assertDoesNotThrow(
                () -> reportService.compareRooms(USER_ID, request));
        assertNotNull(res);
        assertNotNull(res.getCompareData());
    }

    @Test
    @DisplayName("compareRooms - BUILDING_INFO에 nullable enum/boolean이 섞여도 500 대신 정상 응답 (BC-RPT-03)")
    void testCompareRoomsBuildingInfoNullableFieldsDoNotThrow() {
        Long roomId = 101L;
        CompareRoomRequestDTO request = CompareRoomRequestDTO.builder()
                .roomIds(List.of(roomId))
                .categories(List.of("BUILDING_INFO"))
                .build();

        when(roomRepository.countByIdInAndUserIdAndIsDeletedFalse(any(Collection.class), eq(USER_ID)))
                .thenReturn(1L);

        Room room = mock(Room.class);
        lenient().when(room.getFloor()).thenReturn(3);
        lenient().when(room.getBuildingType()).thenReturn(null);
        lenient().when(room.getHasElevator()).thenReturn(null);
        lenient().when(room.getDirection()).thenReturn(null);
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));

        CompareRoomResponseDTO res = assertDoesNotThrow(
                () -> reportService.compareRooms(USER_ID, request));
        assertNotNull(res);
        assertNotNull(res.getCompareData());
    }

    @Test
    @DisplayName("compareRooms - 중복 roomId는 소유권 검증에서 dedupe된다 (BC-RPT-02)")
    void testCompareRoomsDedupesRoomIds() {
        CompareRoomRequestDTO request = CompareRoomRequestDTO.builder()
                .roomIds(List.of(1L, 1L, 2L))
                .categories(List.of("NOT_A_REAL_CATEGORY"))
                .build();

        when(roomRepository.countByIdInAndUserIdAndIsDeletedFalse(any(Collection.class), eq(USER_ID)))
                .thenReturn(2L);

        GeneralException ex = assertThrows(GeneralException.class,
                () -> reportService.compareRooms(USER_ID, request));

        assertEquals(ReportErrorCode.UNKNOWN_CATEGORY, ex.getErrorCode());
    }
}
