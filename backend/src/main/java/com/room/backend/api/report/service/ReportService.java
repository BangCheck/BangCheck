package com.room.backend.api.report.service;

import com.room.backend.api.report.dto.request.CompareRoomRequestDTO;
import com.room.backend.api.report.dto.response.*;
import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.repository.*;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.ReportErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private final RoomRepository roomRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final RoomCheckResultRepository roomCheckResultRepository;
    private final RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository;
    private final ChecklistOptionRepository checklistOptionRepository;

    public ReportInfoResponseDTO getRoomsForCompare(Long userId) {

        List<RoomSummaryDTO> rooms = roomRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(RoomSummaryDTO::from)
                .toList();

        List<CategoryDTO> categories = Arrays.stream(ChecklistCategory.values())
                .map(CategoryDTO::from)
                .toList();

        return ReportInfoResponseDTO.builder()
                .rooms(rooms)
                .categories(categories)
                .build();
    }

    public CompareRoomResponseDTO compareRooms(Long userId, CompareRoomRequestDTO requestDTO) {
        List<Long> roomIds = requestDTO.getRoomIds();
        List<String> categories = requestDTO.getCategories();

        if (roomIds != null && !roomIds.isEmpty()) {
            Set<Long> uniqueRoomIds = new LinkedHashSet<>(roomIds);
            long ownedCount = roomRepository.countByIdInAndUserIdAndIsDeletedFalse(uniqueRoomIds, userId);
            if (ownedCount != uniqueRoomIds.size()) {
                throw new GeneralException(ReportErrorCode.FORBIDDEN_ROOM_ACCESS);
            }
        }

        List<CategoryGroupDTO> compareData = new ArrayList<>();

        for (String categoryName : categories) {
            ChecklistCategory category;
            try {
                category = ChecklistCategory.valueOf(categoryName);
            } catch (IllegalArgumentException e) {
                throw new GeneralException(ReportErrorCode.UNKNOWN_CATEGORY);
            }

            List<RoomCompareItemDTO> itemsData = new ArrayList<>();

            if ("BASIC_INFO".equals(categoryName)) {
                itemsData = buildBasicInfoItems(roomIds);
            } else if ("BUILDING_INFO".equals(categoryName)) {
                itemsData = buildBuildingInfoItems(roomIds);
            } else {
                List<ChecklistItem> items = checklistItemRepository.findByCategory(category);
                itemsData = items.stream()
                        .map(item -> buildCompareItem(item, roomIds))
                        .filter(item -> !item.getRooms().isEmpty())
                        .collect(Collectors.toList());
            }

            if (!itemsData.isEmpty()) {
                CategoryGroupDTO categoryGroup = CategoryGroupDTO.builder()
                        .category(categoryName)
                        .categoryName(category.getDescription())
                        .items(itemsData)
                        .build();
                compareData.add(categoryGroup);
            }
        }

        return CompareRoomResponseDTO.builder()
                .compareData(compareData)
                .build();
    }

    private List<RoomCompareItemDTO> buildBasicInfoItems(List<Long> roomIds) {
        List<RoomCompareItemDTO> items = new ArrayList<>();

        items.add(buildRoomFieldItem("매물명", roomIds, room -> room.getName()));
        items.add(buildRoomFieldItem("주소", roomIds, room -> room.getAddress()));
        items.add(buildRoomFieldItem("거래 유형", roomIds, room -> room.getRentType().name()));
        items.add(buildRoomFieldItem("보증금(만원)", roomIds, room -> room.getDeposit() != null ? room.getDeposit().toString() : null));
        items.add(buildRoomFieldItem("월세(만원)", roomIds, room -> room.getMonthlyRent() != null ? room.getMonthlyRent().toString() : null));
        items.add(buildRoomFieldItem("관리비(만원)", roomIds, room -> room.getMaintenanceFee() != null ? room.getMaintenanceFee().toString() : null));
        items.add(buildRoomFieldItem("융자 여부", roomIds, room -> room.getHasLoan().toString()));
        items.add(buildRoomFieldItem("융자 금액(만원)", roomIds, room -> room.getLoanAmount() != null ? room.getLoanAmount().toString() : null));
        items.add(buildRoomFieldItem("전입 신고 가능여부", roomIds, room -> room.getCanRegisterAddress().toString()));
        items.add(buildRoomFieldItem("입주가능일", roomIds, room -> room.getAvailableFrom() != null ? room.getAvailableFrom().toString() : null));

        return items.stream()
                .filter(item -> !item.getRooms().isEmpty())
                .collect(Collectors.toList());
    }

    private List<RoomCompareItemDTO> buildBuildingInfoItems(List<Long> roomIds) {
        List<RoomCompareItemDTO> items = new ArrayList<>();

        items.add(buildRoomFieldItem("건물 유형", roomIds, room -> room.getBuildingType().name()));
        items.add(buildRoomFieldItem("층수", roomIds, room -> room.getFloor() != null ? room.getFloor().toString() : null));
        items.add(buildRoomFieldItem("엘리베이터", roomIds, room -> room.getHasElevator().toString()));
        items.add(buildRoomFieldItem("방 방향", roomIds, room -> room.getDirection().getDescription()));

        return items.stream()
                .filter(item -> !item.getRooms().isEmpty())
                .collect(Collectors.toList());
    }

    private RoomCompareItemDTO buildRoomFieldItem(String fieldName, List<Long> roomIds, java.util.function.Function<com.room.backend.domain.room.entity.Room, String> fieldExtractor) {
        Map<Long, RoomCompareValueDTO> roomsData = new LinkedHashMap<>();
        boolean hasAnyData = false;

        // 먼저 1개 이상의 room이 해당 필드에 데이터를 가지고 있는지 확인
        for (Long roomId : roomIds) {
            var room = roomRepository.findById(roomId);
            if (room.isPresent()) {
                String value = fieldExtractor.apply(room.get());
                if (value != null) {
                    hasAnyData = true;
                    break;
                }
            }
        }

        // 1개 이상 데이터가 있으면, 모든 room의 데이터 추가
        if (hasAnyData) {
            for (Long roomId : roomIds) {
                var room = roomRepository.findById(roomId);
                RoomCompareValueDTO valueDTO;

                if (room.isPresent()) {
                    String value = fieldExtractor.apply(room.get());
                    valueDTO = RoomCompareValueDTO.builder()
                            .valueText(value)
                            .valueNumber(null)
                            .selectedOptions(null)
                            .build();
                } else {
                    valueDTO = RoomCompareValueDTO.builder()
                            .valueText(null)
                            .valueNumber(null)
                            .selectedOptions(null)
                            .build();
                }

                roomsData.put(roomId, valueDTO);
            }
        }

        return RoomCompareItemDTO.builder()
                .itemId(null)
                .itemName(fieldName)
                .itemType("ROOM_FIELD")
                .rooms(roomsData)
                .build();
    }

    private RoomCompareItemDTO buildCompareItem(ChecklistItem item, List<Long> roomIds) {
        List<RoomCheckResult> results = roomCheckResultRepository.findByRoomIdInAndItemId(roomIds, item.getId());

        Map<Long, RoomCompareValueDTO> roomsData = new LinkedHashMap<>();

        if (!results.isEmpty()) {
            Map<Long, RoomCheckResult> resultMap = results.stream()
                    .collect(Collectors.toMap(RoomCheckResult::getRoomId, r -> r));

            for (Long roomId : roomIds) {
                RoomCheckResult checkResult = resultMap.get(roomId);
                RoomCompareValueDTO valueDTO;

                if (checkResult != null) {
                    List<SelectedOptionDTO> selectedOptions = getSelectedOptions(checkResult.getId(), item);

                    if (!selectedOptions.isEmpty()) {
                        valueDTO = RoomCompareValueDTO.builder()
                                .valueText(null)
                                .valueNumber(null)
                                .selectedOptions(selectedOptions)
                                .build();
                    } else {
                        valueDTO = RoomCompareValueDTO.builder()
                                .valueText(checkResult.getValueText())
                                .valueNumber(checkResult.getValueNumber())
                                .selectedOptions(null)
                                .build();
                    }
                } else {
                    valueDTO = RoomCompareValueDTO.builder()
                            .valueText(null)
                            .valueNumber(null)
                            .selectedOptions(null)
                            .build();
                }

                roomsData.put(roomId, valueDTO);
            }
        }

        return RoomCompareItemDTO.builder()
                .itemId(item.getId())
                .itemName(item.getItemName())
                .itemType(item.getItemType().name())
                .rooms(roomsData)
                .build();
    }

    private List<SelectedOptionDTO> getSelectedOptions(Long resultId, ChecklistItem item) {
        List<RoomCheckSelectedOption> selectedOptions = roomCheckSelectedOptionRepository.findByResultId(resultId);
        boolean isInnerState = ChecklistCategory.INTERNAL_STATE.equals(item.getCategory());

        return selectedOptions.stream()
                .map(selected -> {
                    ChecklistOption option = checklistOptionRepository.findById(selected.getOptionId())
                            .orElse(null);

                    if (option != null) {
                        Integer optionScore = null;
                        if (isInnerState) {
                            optionScore = mapInnerStateScore(option.getOptionValue());
                        }
                        return SelectedOptionDTO.builder()
                                .optionId(option.getId())
                                .optionValue(option.getOptionValue())
                                .optionScore(optionScore)
                                .build();
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private Integer mapInnerStateScore(String optionValue) {
        return switch (optionValue) {
            case "나쁨" -> 1;
            case "보통" -> 3;
            case "좋음" -> 5;
            default -> null;
        };
    }
}
