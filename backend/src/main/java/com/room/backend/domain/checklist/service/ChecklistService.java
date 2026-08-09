package com.room.backend.domain.checklist.service;

import com.room.backend.domain.checklist.dto.response.ChecklistItemResponse;
import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.UserChecklistSetting;
import com.room.backend.domain.checklist.entity.UserTypeSelection;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.entity.enums.InputType;
import com.room.backend.domain.checklist.entity.enums.ItemType;
import com.room.backend.domain.checklist.entity.enums.UserType;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.global.common.exception.ChecklistErrorCode;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.UserChecklistSettingRepository;
import com.room.backend.domain.checklist.repository.UserTypeSelectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    private static final List<UserType> CHECKLIST_USER_TYPES = List.of(
            UserType.BUG_AVOIDER,
            UserType.NOISE_SENSITIVE,
            UserType.CLEAN_FREAK,
            UserType.PERFORMANCE_TYPE
    );

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getCustomizedItems(Long userId) {
        List<UserTypeSelection> userTypes = userTypeSelectionRepository.findByUserId(userId);
        List<UserType> selectedTypes = userTypes.stream()
                .map(UserTypeSelection::getUserType)
                .toList();

        if (selectedTypes.contains(UserType.ESSENTIALS_ONLY)) {
            return getEssentialsOnlyItems(userId);
        }

        List<ChecklistItem> items;
        if (selectedTypes.contains(UserType.FIRST_TIMER)) {
            items = checklistItemRepository.findFirstTimerItems(userId);
        } else {
            List<UserType> queryTypes = selectedTypes.stream()
                    .filter(CHECKLIST_USER_TYPES::contains)
                    .toList();
            items = queryTypes.isEmpty()
                    ? checklistItemRepository.findDefaultAndCustomItems(userId)
                    : checklistItemRepository.findCustomizedItems(userId, queryTypes);
        }
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

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getEssentialsOnlyItems(Long userId) {
        List<ChecklistItem> items = checklistItemRepository.findEssentialsOnlyItems(userId);
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

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getAllItemsForSettings(Long userId) {
        List<ChecklistItem> items = checklistItemRepository.findAllForSettings(userId);
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

    @Transactional(readOnly = true)
    public List<UserType> getSelectedUserTypes(Long userId) {
        return userTypeSelectionRepository.findByUserId(userId)
                .stream()
                .map(UserTypeSelection::getUserType)
                .toList();
    }

    public void saveSettings(Long userId, List<Long> disabledItemIds) {
        userChecklistSettingRepository.deleteByUserId(userId);
        userChecklistSettingRepository.flush();
        List<UserChecklistSetting> settings = disabledItemIds.stream()
                .map(itemId -> UserChecklistSetting.of(userId, itemId, false))
                .toList();
        userChecklistSettingRepository.saveAll(settings);
    }

    public void addCustomItem(Long userId, String itemName) {
        List<ChecklistItem> customItems = checklistItemRepository.findByItemType(ItemType.CUSTOM)
                .stream()
                .filter(item -> userId.equals(item.getOwnerUserId()))
                .filter(item -> !item.isDeleted())
                .toList();

        if (customItems.size() >= MAX_CUSTOM_ITEMS) {
            throw new GeneralException(ChecklistErrorCode.CUSTOM_ITEM_LIMIT_EXCEEDED);
        }

        ChecklistItem customItem = ChecklistItem.builder()
                .itemName(itemName)
                .category(ChecklistCategory.CONVENIENCE)
                .itemType(ItemType.CUSTOM)
                .inputType(InputType.BOOLEAN)
                .ownerUserId(userId)
                .build();

        checklistItemRepository.save(customItem);
    }

    public void deleteCustomItem(Long userId, Long customItemId) {
        ChecklistItem item = checklistItemRepository.findById(customItemId)
                .orElseThrow(() -> new GeneralException(ChecklistErrorCode.CUSTOM_ITEM_NOT_FOUND));

        if (item.isDeleted()) {
            throw new GeneralException(ChecklistErrorCode.CUSTOM_ITEM_NOT_FOUND);
        }

        if (!userId.equals(item.getOwnerUserId())) {
            throw new GeneralException(ChecklistErrorCode.CUSTOM_ITEM_FORBIDDEN);
        }

        item.softDelete();
    }
}
