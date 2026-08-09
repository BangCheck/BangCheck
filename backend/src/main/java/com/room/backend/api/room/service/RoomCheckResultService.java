package com.room.backend.api.room.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.api.room.dto.response.RoomIssuesSummaryDTO;
import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.global.common.exception.ChecklistErrorCode;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.domain.checklist.dto.response.RoomCheckResultResponseDTO;
import com.room.backend.domain.checklist.dto.response.RoomCheckSelectedOptionResponseDTO;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.entity.enums.ChecklistIssueType;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomCheckResultService {

    private final RoomCheckResultRepository roomCheckResultRepository;
    private final RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository;
    private final ChecklistOptionRepository checklistOptionRepository;
    private final ChecklistItemRepository checklistItemRepository;
    
    @Transactional
    public void saveCheckResult(Long roomId, List<RoomCheckAnswerRequestDTO> answers) {
        for (RoomCheckAnswerRequestDTO answer : answers) {
            RoomCheckResult result = RoomCheckResult.create(roomId, answer.getItemId(), answer.getValueText(), answer.getValueNumber());
            roomCheckResultRepository.save(result);

            if(answer.getSelectedOptionIds() != null) {
                for (Long optionId : answer.getSelectedOptionIds()) {
                    RoomCheckSelectedOption selectedOption = RoomCheckSelectedOption.create(result.getId(), optionId);
                    roomCheckSelectedOptionRepository.save(selectedOption);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<RoomCheckResultResponseDTO> getCheckResults(Long roomId) {
        List<RoomCheckResult> results = roomCheckResultRepository.findByRoomId(roomId);

        return results.stream()
            .map(result -> {
                ChecklistItem item = checklistItemRepository.findById(result.getItemId())
                    .orElseThrow(() -> new GeneralException(ChecklistErrorCode.CHECKLIST_ITEM_NOT_FOUND));
                List<RoomCheckSelectedOptionResponseDTO> selectedOptions =
                    roomCheckSelectedOptionRepository.findByResultId(result.getId())
                        .stream()
                        .map(selected -> {
                            ChecklistOption option = checklistOptionRepository.findById(selected.getOptionId())
                                .orElseThrow(() -> new GeneralException(ChecklistErrorCode.CHECKLIST_OPTION_NOT_FOUND));
                            return new RoomCheckSelectedOptionResponseDTO(option);
                        })
                        .toList();
                return new RoomCheckResultResponseDTO(result, item.getItemName(), selectedOptions);
            })
            .toList();
    }

    @Transactional
    public void updateCheckResults(Long roomId, List<RoomCheckAnswerRequestDTO> answers) {
        List<RoomCheckResult> existingResults = roomCheckResultRepository.findByRoomId(roomId);
        for (RoomCheckResult result : existingResults) {
            roomCheckSelectedOptionRepository.deleteByResultId(result.getId());
            roomCheckResultRepository.delete(result);
        }
        roomCheckResultRepository.flush();

        saveCheckResult(roomId, answers);
    }

    @Transactional(readOnly = true)
    public RoomIssuesSummaryDTO getRoomIssuesSummary(Long roomId) {
        return getRoomIssuesSummaries(List.of(roomId)).get(roomId);
    }

    @Transactional(readOnly = true)
    public Map<Long, RoomIssuesSummaryDTO> getRoomIssuesSummaries(List<Long> roomIds) {
        if (roomIds.isEmpty()) {
            return Map.of();
        }

        List<RoomCheckResult> results = roomCheckResultRepository.findByRoomIdIn(roomIds);
        Map<Long, ChecklistItem> itemsById = checklistItemRepository.findAllById(
                results.stream().map(RoomCheckResult::getItemId).distinct().toList())
            .stream()
            .collect(Collectors.toMap(ChecklistItem::getId, Function.identity()));

        List<RoomCheckResult> problemResults = results.stream()
            .filter(result -> {
                ChecklistItem item = itemsById.get(result.getItemId());
                return item != null && item.getCategory() == ChecklistCategory.PROBLEM;
            })
            .toList();

        List<RoomCheckSelectedOption> selectedOptions = problemResults.isEmpty()
            ? List.of()
            : roomCheckSelectedOptionRepository.findByResultIdIn(
                problemResults.stream().map(RoomCheckResult::getId).toList());

        Map<Long, ChecklistOption> optionsById = checklistOptionRepository.findAllById(
                selectedOptions.stream().map(RoomCheckSelectedOption::getOptionId).distinct().toList())
            .stream()
            .collect(Collectors.toMap(ChecklistOption::getId, Function.identity()));

        Map<Long, List<RoomCheckSelectedOption>> selectedOptionsByResultId = selectedOptions.stream()
            .collect(Collectors.groupingBy(RoomCheckSelectedOption::getResultId));

        Map<Long, Map<ChecklistIssueType, Boolean>> issuesByRoomId = new HashMap<>();
        for (RoomCheckResult result : problemResults) {
            ChecklistItem item = itemsById.get(result.getItemId());
            if (item.getIssueType() == null) {
                continue;
            }
            boolean hasIssue = selectedOptionsByResultId.getOrDefault(result.getId(), List.of())
                .stream()
                .map(selected -> optionsById.get(selected.getOptionId()))
                .filter(option -> option != null)
                .anyMatch(option -> !"없음".equals(option.getOptionValue()));

            issuesByRoomId.computeIfAbsent(result.getRoomId(), ignored -> new EnumMap<>(ChecklistIssueType.class))
                .put(item.getIssueType(), hasIssue);
        }

        return roomIds.stream().distinct().collect(Collectors.toMap(
            Function.identity(),
            roomId -> toIssuesSummary(issuesByRoomId.getOrDefault(roomId, Map.of())),
            (first, ignored) -> first,
            LinkedHashMap::new));
    }

    private RoomIssuesSummaryDTO toIssuesSummary(Map<ChecklistIssueType, Boolean> issueMap) {
        return new RoomIssuesSummaryDTO(
            issueMap.getOrDefault(ChecklistIssueType.MOLD, false),
            issueMap.getOrDefault(ChecklistIssueType.LEAK, false),
            issueMap.getOrDefault(ChecklistIssueType.BUG, false),
            issueMap.getOrDefault(ChecklistIssueType.DRAIN_SMELL, false),
            issueMap.getOrDefault(ChecklistIssueType.CONDENSATION, false)
        );
    }
}
