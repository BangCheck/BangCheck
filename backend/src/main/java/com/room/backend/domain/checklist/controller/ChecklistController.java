package com.room.backend.domain.checklist.controller;

import com.room.backend.domain.checklist.dto.request.ChecklistSettingsRequest;
import com.room.backend.domain.checklist.dto.request.CustomItemCreateRequest;
import com.room.backend.domain.checklist.dto.response.ChecklistItemResponse;
import com.room.backend.domain.checklist.entity.enums.UserType;
import com.room.backend.domain.checklist.service.ChecklistService;
import com.room.backend.global.auth.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping("/items")
    public ResponseEntity<List<ChecklistItemResponse>> getCustomizedItems() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<ChecklistItemResponse> items = checklistService.getCustomizedItems(userId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/all")
    public ResponseEntity<List<ChecklistItemResponse>> getAllItemsForSettings() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<ChecklistItemResponse> items = checklistService.getAllItemsForSettings(userId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/types/{userType}")
    public ResponseEntity<List<ChecklistItemResponse>> selectUserType(@PathVariable UserType userType) {
        Long userId = SecurityUtil.getCurrentUserId();
        checklistService.selectUserType(userId, userType);
        List<ChecklistItemResponse> items = checklistService.getCustomizedItems(userId);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/types/{userType}")
    public ResponseEntity<Void> deselectUserType(@PathVariable UserType userType) {
        Long userId = SecurityUtil.getCurrentUserId();
        checklistService.deselectUserType(userId, userType);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/items/settings")
    public ResponseEntity<Void> saveSettings(@RequestBody ChecklistSettingsRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        checklistService.saveSettings(userId, request.getDisabledItemIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/items/custom")
    public ResponseEntity<Void> addCustomItem(@RequestBody CustomItemCreateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        checklistService.addCustomItem(userId, request.getItemName());
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/items/custom/{customItemId}")
    public ResponseEntity<Void> deleteCustomItem(@PathVariable Long customItemId) {
        Long userId = SecurityUtil.getCurrentUserId();
        checklistService.deleteCustomItem(userId, customItemId);
        return ResponseEntity.ok().build();
    }
}
