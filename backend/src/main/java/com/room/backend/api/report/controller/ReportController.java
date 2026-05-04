package com.room.backend.api.report.controller;

import com.room.backend.api.report.dto.response.ReportInfoResponseDTO;
import com.room.backend.api.report.service.ReportService;
import com.room.backend.global.auth.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
