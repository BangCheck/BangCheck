package com.room.backend.api.room.controller;

import com.room.backend.api.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.api.room.dto.response.RoomCreateResponseDTO;
import com.room.backend.api.room.service.RoomService;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.global.auth.util.SecurityUtil;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room", description = "방 관리")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @Operation(summary = "방 등록", description = "새로운 방을 등록합니다. 주소를 기반으로 좌표를 자동 변환합니다.")
    public ResponseEntity<ApiResponse<RoomCreateResponseDTO>> createRoom(
            @RequestBody RoomCreateRequestDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        Room savedRoom = roomService.createRoom(request, userId);
        return ResponseEntity.ok(ApiResponse.success(new RoomCreateResponseDTO(savedRoom)));
    }
}
