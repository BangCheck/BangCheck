package com.room.backend.api.map.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.room.backend.api.map.dto.response.MapRoomResponseDTO;
import com.room.backend.api.map.service.MapService;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.global.auth.util.SecurityUtil;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
@Tag(name = "Map", description = "지도 관련 API")
public class MapController {

    private final MapService mapService;

    @GetMapping("/rooms")
    @Operation(summary = "지도용 매물 목록 조회", description = "지도에 표시할 내 방 목록을 반환합니다.")
    public ResponseEntity<ApiResponse<List<MapRoomResponseDTO>>> getMapRooms(
            @RequestParam(required = false) RentType rentType) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<Room> rooms = mapService.getRoomsForMap(userId, rentType);
        List<MapRoomResponseDTO> response = rooms.stream()
                .map(room -> new MapRoomResponseDTO(
                        room.getId(),
                        room.getAddress(),
                        room.getLat(),
                        room.getLon(),
                        room.getRentType(),
                        room.getDeposit(),
                        room.getMonthlyRent()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
