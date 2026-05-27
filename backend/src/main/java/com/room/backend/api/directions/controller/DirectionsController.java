package com.room.backend.api.directions.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.room.backend.api.directions.dto.response.DirectionsResponseDTO;
import com.room.backend.api.directions.service.DirectionsService;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/directions")
@RequiredArgsConstructor
@Tag(name = "Directions", description = "경로 탐색")
public class DirectionsController {

    private final DirectionsService directionsService;

    @GetMapping("/walking")
    @Operation(summary = "도보 경로 조회", description = "출발지와 목적지 좌표를 기반으로 도보 경로를 조회합니다.")
    public ResponseEntity<ApiResponse<DirectionsResponseDTO>> getWalkingDirections(
        @RequestParam double startLat,
        @RequestParam double startLng,
        @RequestParam double goalLat,
        @RequestParam double goalLng
    ) {
        DirectionsResponseDTO result = directionsService.getWalkingDirections(startLat, startLng, goalLat, goalLng);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
