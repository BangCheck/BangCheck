package com.room.backend.api.directions.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.room.backend.api.directions.dto.response.WalkingDirectionsResponseDTO;
import com.room.backend.api.directions.service.DirectionsService;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/directions")
@RequiredArgsConstructor
@Tag(name = "Directions", description = "경로 탐색 API")
public class DirectionsController {

    private final DirectionsService directionsService;

    @GetMapping("/walking")
    @Operation(summary = "도보 경로 조회", description = "NCP Directions API를 통해 두 좌표 간 도보 경로를 반환합니다.")
    public ResponseEntity<ApiResponse<WalkingDirectionsResponseDTO>> getWalkingDirections(
            @RequestParam double startLat,
            @RequestParam double startLng,
            @RequestParam double goalLat,
            @RequestParam double goalLng
    ) {
        WalkingDirectionsResponseDTO result =
                directionsService.getWalkingDirections(startLat, startLng, goalLat, goalLng);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
