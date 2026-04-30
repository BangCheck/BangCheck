package com.room.backend.domain.checklist.service;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.UserChecklistSetting;
import com.room.backend.domain.checklist.entity.UserTypeSelection;
import com.room.backend.domain.checklist.entity.enums.*;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.UserChecklistSettingRepository;
import com.room.backend.domain.checklist.repository.UserTypeSelectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChecklistService 테스트")
class ChecklistServiceTest {

    @Mock
    private ChecklistItemRepository checklistItemRepository;

    @Mock
    private ChecklistOptionRepository checklistOptionRepository;

    @Mock
    private UserTypeSelectionRepository userTypeSelectionRepository;

    @Mock
    private UserChecklistSettingRepository userChecklistSettingRepository;

    @InjectMocks
    private ChecklistService checklistService;

    private Long userId;
    private ChecklistItem defaultItem;
    private ChecklistItem userTypeItem;
    private ChecklistOption option;

    @BeforeEach
    void setUp() {
        userId = 1L;

        defaultItem = ChecklistItem.builder()
                .id(1L)
                .itemName("곰팡이")
                .category(ChecklistCategory.PROBLEM)
                .itemType(ItemType.DEFAULT)
                .inputType(InputType.BOOLEAN)
                .build();

        userTypeItem = ChecklistItem.builder()
                .id(2L)
                .itemName("채광")
                .category(ChecklistCategory.OPTION)
                .itemType(ItemType.USER_TYPE)
                .userType(UserType.NOISE_SENSITIVE)
                .inputType(InputType.BOOLEAN)
                .build();

        option = ChecklistOption.builder()
                .id(1L)
                .checklistItemId(1L)
                .optionValue("있음")
                .displayOrder(1)
                .build();
    }

    @Test
    @DisplayName("getCustomizedItems - 맞춤 항목 조회")
    void testGetCustomizedItems() {
        // Given
        UserTypeSelection selection = UserTypeSelection.of(userId, UserType.NOISE_SENSITIVE);
        when(userTypeSelectionRepository.findByUserId(userId))
                .thenReturn(List.of(selection));
        when(checklistItemRepository.findCustomizedItems(userId, List.of(UserType.NOISE_SENSITIVE)))
                .thenReturn(List.of(defaultItem, userTypeItem));
        when(checklistOptionRepository.findByChecklistItemId(1L))
                .thenReturn(List.of(option));
        when(checklistOptionRepository.findByChecklistItemId(2L))
                .thenReturn(List.of());
        when(userChecklistSettingRepository.findByUserIdAndIsEnabledFalse(userId))
                .thenReturn(List.of());

        // When
        var items = checklistService.getCustomizedItems(userId);

        // Then
        assertEquals(2, items.size());
        assertEquals("곰팡이", items.get(0).getItemName());
        assertEquals("채광", items.get(1).getItemName());
        assertTrue(items.get(0).getIsEnabled());
        assertTrue(items.get(1).getIsEnabled());
    }

    @Test
    @DisplayName("getCustomizedItems - OFF 항목 제외")
    void testGetCustomizedItemsWithDisabled() {
        // Given
        UserChecklistSetting disabledSetting = UserChecklistSetting.of(userId, 1L, false);
        when(userTypeSelectionRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(checklistItemRepository.findCustomizedItems(userId, List.of()))
                .thenReturn(List.of(defaultItem));
        when(checklistOptionRepository.findByChecklistItemId(1L))
                .thenReturn(List.of(option));
        when(userChecklistSettingRepository.findByUserIdAndIsEnabledFalse(userId))
                .thenReturn(List.of(disabledSetting));

        // When
        var items = checklistService.getCustomizedItems(userId);

        // Then
        assertEquals(1, items.size());
        assertFalse(items.get(0).getIsEnabled());
    }

    @Test
    @DisplayName("selectUserType - 페르소나 선택")
    void testSelectUserType() {
        // Given
        when(userTypeSelectionRepository.findByUserIdAndUserType(userId, UserType.BUG_AVOIDER))
                .thenReturn(Optional.empty());

        // When
        checklistService.selectUserType(userId, UserType.BUG_AVOIDER);

        // Then
        verify(userTypeSelectionRepository, times(1)).save(any(UserTypeSelection.class));
    }

    @Test
    @DisplayName("selectUserType - 중복 선택 무시")
    void testSelectUserTypeDuplicate() {
        // Given
        UserTypeSelection existing = UserTypeSelection.of(userId, UserType.BUG_AVOIDER);
        when(userTypeSelectionRepository.findByUserIdAndUserType(userId, UserType.BUG_AVOIDER))
                .thenReturn(Optional.of(existing));

        // When
        checklistService.selectUserType(userId, UserType.BUG_AVOIDER);

        // Then
        verify(userTypeSelectionRepository, never()).save(any(UserTypeSelection.class));
    }

    @Test
    @DisplayName("deselectUserType - 페르소나 취소")
    void testDeselectUserType() {
        // When
        checklistService.deselectUserType(userId, UserType.BUG_AVOIDER);

        // Then
        verify(userTypeSelectionRepository, times(1))
                .deleteByUserIdAndUserType(userId, UserType.BUG_AVOIDER);
    }

    @Test
    @DisplayName("toggleItem - 기존 항목 토글")
    void testToggleItemExisting() {
        // Given
        UserChecklistSetting setting = UserChecklistSetting.of(userId, 1L, true);
        when(userChecklistSettingRepository.findByUserIdAndItemId(userId, 1L))
                .thenReturn(Optional.of(setting));

        // When
        checklistService.toggleItem(userId, 1L);

        // Then
        assertFalse(setting.getIsEnabled());
        verify(userChecklistSettingRepository, never()).save(any());
    }

    @Test
    @DisplayName("toggleItem - 새 항목 OFF로 생성")
    void testToggleItemNew() {
        // Given
        when(userChecklistSettingRepository.findByUserIdAndItemId(userId, 1L))
                .thenReturn(Optional.empty());

        // When
        checklistService.toggleItem(userId, 1L);

        // Then
        verify(userChecklistSettingRepository, times(1)).save(any(UserChecklistSetting.class));
    }

    @Test
    @DisplayName("addCustomItem - 나만의 항목 추가")
    void testAddCustomItem() {
        // Given
        when(checklistItemRepository.findByItemType(ItemType.CUSTOM))
                .thenReturn(List.of());

        // When
        checklistService.addCustomItem(userId, "베란다 크기");

        // Then
        verify(checklistItemRepository, times(1)).save(any(ChecklistItem.class));
    }

    @Test
    @DisplayName("addCustomItem - 최대 3개 초과 방지")
    void testAddCustomItemMaxExceeded() {
        // Given
        ChecklistItem customItem1 = ChecklistItem.builder()
                .id(10L)
                .itemName("항목1")
                .itemType(ItemType.CUSTOM)
                .ownerUserId(userId)
                .build();
        ChecklistItem customItem2 = ChecklistItem.builder()
                .id(11L)
                .itemName("항목2")
                .itemType(ItemType.CUSTOM)
                .ownerUserId(userId)
                .build();
        ChecklistItem customItem3 = ChecklistItem.builder()
                .id(12L)
                .itemName("항목3")
                .itemType(ItemType.CUSTOM)
                .ownerUserId(userId)
                .build();

        when(checklistItemRepository.findByItemType(ItemType.CUSTOM))
                .thenReturn(List.of(customItem1, customItem2, customItem3));

        // When & Then
        assertThrows(IllegalStateException.class, () ->
                checklistService.addCustomItem(userId, "항목4")
        );
        verify(checklistItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteCustomItem - 소유자의 항목 삭제")
    void testDeleteCustomItem() {
        // Given
        ChecklistItem customItem = ChecklistItem.builder()
                .id(10L)
                .itemName("항목")
                .itemType(ItemType.CUSTOM)
                .ownerUserId(userId)
                .build();

        when(checklistItemRepository.findById(10L))
                .thenReturn(Optional.of(customItem));

        // When
        checklistService.deleteCustomItem(userId, 10L);

        // Then
        assertTrue(customItem.isDeleted());
    }

    @Test
    @DisplayName("deleteCustomItem - 소유자 아닌 경우 실패")
    void testDeleteCustomItemUnauthorized() {
        // Given
        Long otherUserId = 2L;
        ChecklistItem customItem = ChecklistItem.builder()
                .id(10L)
                .itemName("항목")
                .itemType(ItemType.CUSTOM)
                .ownerUserId(otherUserId)
                .build();

        when(checklistItemRepository.findById(10L))
                .thenReturn(Optional.of(customItem));

        // When & Then
        assertThrows(IllegalArgumentException.class, () ->
                checklistService.deleteCustomItem(userId, 10L)
        );
    }

    @Test
    @DisplayName("deleteCustomItem - 항목 없음")
    void testDeleteCustomItemNotFound() {
        // Given
        when(checklistItemRepository.findById(10L))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, () ->
                checklistService.deleteCustomItem(userId, 10L)
        );
    }
}
