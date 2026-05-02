package com.room.backend.domain.checklist.service;

import com.room.backend.domain.checklist.dto.response.ChecklistItemResponse;
import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.UserChecklistSetting;
import com.room.backend.domain.checklist.entity.UserTypeSelection;
import com.room.backend.domain.checklist.entity.enums.ItemType;
import com.room.backend.domain.checklist.entity.enums.UserType;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.UserChecklistSettingRepository;
import com.room.backend.domain.checklist.repository.UserTypeSelectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChecklistService {

    private final ChecklistItemRepository checklistItemRepository;
    private final ChecklistOptionRepository checklistOptionRepository;
    private final UserTypeSelectionRepository userTypeSelectionRepository;
    private final UserChecklistSettingRepository userChecklistSettingRepository;

    private static final int MAX_CUSTOM_ITEMS = 3;

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getCustomizedItems(Long userId) {
        List<UserTypeSelection> userTypes = userTypeSelectionRepository.findByUserId(userId);
        List<UserType> selectedTypes = userTypes.stream()
                .map(UserTypeSelection::getUserType)
                .toList();

        List<ChecklistItem> items = checklistItemRepository.findCustomizedItems(userId, selectedTypes);
        List<Long> disabledItemIds = userChecklistSettingRepository.findByUserIdAndIsEnabledFalse(userId)
                .stream()
                .map(UserChecklistSetting::getItemId)
                .collect(Collectors.toSet())
                .stream()
                .toList();

        return items.stream()
                .map(item -> {
                    List<ChecklistOption> options = checklistOptionRepository.findByChecklistItemId(item.getId());
                    Boolean isEnabled = !disabledItemIds.contains(item.getId());
                    return ChecklistItemResponse.of(item, options, isEnabled);
                })
                .toList();
    }

    public void selectUserType(Long userId, UserType userType) {
        userTypeSelectionRepository.findByUserIdAndUserType(userId, userType)
                .ifPresentOrElse(
                        existing -> {},
                        () -> userTypeSelectionRepository.save(UserTypeSelection.of(userId, userType))
                );
    }

    public void deselectUserType(Long userId, UserType userType) {
        userTypeSelectionRepository.deleteByUserIdAndUserType(userId, userType);
    }

    public void toggleItem(Long userId, Long itemId) {
        userChecklistSettingRepository.findByUserIdAndItemId(userId, itemId)
                .ifPresentOrElse(
                        setting -> setting.toggle(),
                        () -> {
                            UserChecklistSetting newSetting = UserChecklistSetting.of(userId, itemId, false);
                            userChecklistSettingRepository.save(newSetting);
                        }
                );
    }

    public void addCustomItem(Long userId, String itemName) {
        List<ChecklistItem> customItems = checklistItemRepository.findByItemType(ItemType.CUSTOM)
                .stream()
                .filter(item -> userId.equals(item.getOwnerUserId()))
                .toList();

        if (customItems.size() >= MAX_CUSTOM_ITEMS) {
            throw new IllegalStateException("나만의 항목은 최대 3개까지만 추가 가능합니다");
        }

        ChecklistItem customItem = ChecklistItem.builder()
                .itemName(itemName)
                .category(null)
                .itemType(ItemType.CUSTOM)
                .inputType(null)
                .ownerUserId(userId)
                .build();

        checklistItemRepository.save(customItem);
    }

    public void deleteCustomItem(Long userId, Long customItemId) {
        ChecklistItem item = checklistItemRepository.findById(customItemId)
                .orElseThrow(() -> new IllegalArgumentException("항목을 찾을 수 없습니다"));

        if (!userId.equals(item.getOwnerUserId())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다");
        }

        item.softDelete();
    }
}
