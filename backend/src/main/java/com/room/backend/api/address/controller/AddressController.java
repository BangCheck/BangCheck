package com.room.backend.api.address.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.room.backend.api.address.service.AddressSearchService;
import com.room.backend.api.address.dto.response.AddressSearchResponseDTO;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import java.util.List;


@RestController
@RequestMapping("/api/v1/address")
@RequiredArgsConstructor
@Tag(name="Address", description="주소 검색")
public class AddressController {
    
    private final AddressSearchService addressSearchService;

    @GetMapping("/search")
    @Operation(summary = "주소 검색", description = "키워드를 기반으로 주소를 검색합니다.")
    public ResponseEntity<ApiResponse<List<AddressSearchResponseDTO>>> getJuso(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(addressSearchService.getLegitAddress(keyword)));
    }
    
    
}
