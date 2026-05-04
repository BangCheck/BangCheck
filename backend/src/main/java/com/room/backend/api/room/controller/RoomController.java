package com.room.backend.api.room.controller;

import com.room.backend.api.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.api.room.dto.request.RoomUpdateRequestDTO;
import com.room.backend.api.room.dto.response.RoomCreateResponseDTO;
import com.room.backend.api.room.dto.response.RoomDetailResponseDTO;
import com.room.backend.api.room.dto.response.RoomListResponseDTO;
import com.room.backend.api.room.service.RoomCheckResultService;
import com.room.backend.api.room.service.RoomService;
import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.domain.checklist.dto.response.RoomCheckResultResponseDTO;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.global.auth.util.SecurityUtil;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.RoomErrorCode;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room", description = "방 관리")
public class RoomController {

    private final RoomService roomService;
    private final RoomCheckResultService roomCheckResultService;

    @PostMapping
    @Operation(summary = "방 등록", description = "새로운 방을 등록합니다. 주소를 기반으로 좌표를 자동 변환합니다.")
    public ResponseEntity<ApiResponse<RoomCreateResponseDTO>> createRoom(@Valid @RequestBody RoomCreateRequestDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        Room savedRoom = roomService.createRoom(request, userId);

        return ResponseEntity.ok(ApiResponse.success(new RoomCreateResponseDTO(savedRoom)));
    }

    @GetMapping
    @Operation(summary = "내 방들 목록 조회", description = "등록한 방 목록을 최신순으로 반환합니다.")
    public ResponseEntity<ApiResponse<List<RoomListResponseDTO>>> getRooms() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<Room> rooms = roomService.getRooms(userId);
        List<RoomListResponseDTO> response = rooms.stream()
                .map(room -> new RoomListResponseDTO(room))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "내 방 1개 조회", description = "방 한개를 체크리스트 결과와 함께 조회합니다")
    public ResponseEntity<ApiResponse<RoomDetailResponseDTO>> getRoom(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        Room room = roomService.getRoom(id, userId)
                .orElseThrow(() -> new GeneralException(RoomErrorCode.ROOM_NOT_FOUND));
        List<RoomCheckResultResponseDTO> checkResults = roomCheckResultService.getCheckResults(id);

        return ResponseEntity.ok(ApiResponse.success(new RoomDetailResponseDTO(room, checkResults)));
    }

    @PostMapping("/{id}/check-results")
    @Operation(summary = "체크리스트 답변 저장", description = "방에 대한 체크리스트 답변을 저장합니다")
    public ResponseEntity<ApiResponse<Void>> saveCheckResults(@PathVariable Long id,
            @RequestBody List<RoomCheckAnswerRequestDTO> answers) {
        roomCheckResultService.saveCheckResult(id, answers);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/{id}")
    @Operation(summary = "방 수정", description = "방을 수정합니다")
    public ResponseEntity<ApiResponse<RoomCreateResponseDTO>> updateRoom(@Valid @RequestBody RoomUpdateRequestDTO request, @PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        Room editedRoom = roomService.updateRoom(request, id, userId);

        return ResponseEntity.ok(ApiResponse.success(new RoomCreateResponseDTO(editedRoom)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "내 방 1개 삭제", description = "방 한개를 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        roomService.deleteRoom(id, userId);

        return ResponseEntity.ok(ApiResponse.success(null));

    }

}
