package com.room.backend.api.map.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.room.backend.api.map.dto.request.MapPointCreateRequestDTO;
import com.room.backend.api.map.dto.response.MapPointResponseDTO;
import com.room.backend.api.map.dto.response.MapRoomResponseDTO;
import com.room.backend.api.map.service.MapService;
import com.room.backend.domain.map.entity.MapPoint;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.global.auth.util.SecurityUtil;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.RequestBody;
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

    @GetMapping("/points")
    @Operation(summary = "지도용 기준점들 목록 조회", description = "지도에 표시할 기준점 목록을 반환합니다.")
    public ResponseEntity<ApiResponse<List<MapPointResponseDTO>>> getMapPoints() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<MapPoint> mapPoints = mapService.getAllMapPointsForRooms(userId);
        List<MapPointResponseDTO> response = mapPoints.stream()
                .map(point -> new MapPointResponseDTO(
                        point.getId(),
                        point.getName(),
                        point.getAddress(),
                        point.getLat(),
                        point.getLon(),
                        point.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/points")
    @Operation(summary = "지도용 기준점 생성", description = "지도에 표시할 기준점을 생성합니다.")
    public ResponseEntity<ApiResponse<MapPointResponseDTO>> createMapPoint(@RequestBody MapPointCreateRequestDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        MapPoint mapPoint = mapService.createMapPoint(request, userId);
        MapPointResponseDTO response = new MapPointResponseDTO(
                mapPoint.getId(),
                mapPoint.getName(),
                mapPoint.getAddress(),
                mapPoint.getLat(),
                mapPoint.getLon(),
                mapPoint.getCreatedAt()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/points/{pointId}")
    @Operation(summary = "지도용 기준점 삭제", description = "지도에 표시되어있는 기준점을 삭제합니다.")
    public ResponseEntity<ApiResponse<Void>> deleteMapPoint(@PathVariable Long pointId) {
        Long userId = SecurityUtil.getCurrentUserId();
        mapService.deleteMapPoint(pointId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }



}
