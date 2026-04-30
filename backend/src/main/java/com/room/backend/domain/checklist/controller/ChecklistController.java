package com.room.backend.domain.checklist.controller;

import com.room.backend.domain.checklist.dto.request.CustomItemCreateRequest;
import com.room.backend.domain.checklist.dto.response.ChecklistItemResponse;
import com.room.backend.domain.checklist.entity.enums.UserType;
import com.room.backend.domain.checklist.service.ChecklistService;
import com.room.backend.global.auth.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;
    private final JwtProvider jwtProvider;

    @GetMapping("/items")
    public ResponseEntity<List<ChecklistItemResponse>> getCustomizedItems(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtProvider.getUserIdFromToken(token);
        List<ChecklistItemResponse> items = checklistService.getCustomizedItems(userId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/types/{userType}")
    public ResponseEntity<Void> selectUserType(
            @PathVariable UserType userType,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtProvider.getUserIdFromToken(token);
        checklistService.selectUserType(userId, userType);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/types/{userType}")
    public ResponseEntity<Void> deselectUserType(
            @PathVariable UserType userType,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtProvider.getUserIdFromToken(token);
        checklistService.deselectUserType(userId, userType);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/items/{itemId}/toggle")
    public ResponseEntity<Void> toggleItem(
            @PathVariable Long itemId,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtProvider.getUserIdFromToken(token);
        checklistService.toggleItem(userId, itemId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/items/custom")
    public ResponseEntity<Void> addCustomItem(
            @RequestBody CustomItemCreateRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtProvider.getUserIdFromToken(token);
        checklistService.addCustomItem(userId, request.getItemName());
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/items/custom/{customItemId}")
    public ResponseEntity<Void> deleteCustomItem(
            @PathVariable Long customItemId,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtProvider.getUserIdFromToken(token);
        checklistService.deleteCustomItem(userId, customItemId);
        return ResponseEntity.ok().build();
    }
}
