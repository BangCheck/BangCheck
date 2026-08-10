package com.room.backend.api.report.controller;

import com.room.backend.api.report.dto.request.CompareRoomRequestDTO;
import com.room.backend.api.report.dto.response.CompareRoomResponseDTO;
import com.room.backend.api.report.dto.response.ReportInfoResponseDTO;
import com.room.backend.api.report.service.ReportService;
import com.room.backend.global.auth.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/report")
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/info")
    @Operation(summary = "사용자 매물 요약 리스트", description = "매물 비교 페이지 진입 시 사용자의 방 목록 반환 API")
    public ResponseEntity<ReportInfoResponseDTO> getRoomsForCompare(){
        Long userId = SecurityUtil.getCurrentUserId();
        ReportInfoResponseDTO rooms = reportService.getRoomsForCompare(userId);

        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/compare")
    @Operation(summary = "방 매물 비교", description = "선택한 방 매물들을 카테고리별로 비교하는 API")
    public ResponseEntity<CompareRoomResponseDTO> compareRooms(
            @RequestBody CompareRoomRequestDTO requestDTO) {
        Long userId = SecurityUtil.getCurrentUserId();
        CompareRoomResponseDTO response = reportService.compareRooms(userId, requestDTO);

        return ResponseEntity.ok(response);
    }
}
