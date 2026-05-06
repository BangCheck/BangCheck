package com.room.backend.api.room.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.global.common.exception.ChecklistErrorCode;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.domain.checklist.dto.response.RoomCheckResultResponseDTO;
import com.room.backend.domain.checklist.dto.response.RoomCheckSelectedOptionResponseDTO;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;

import java.util.List;


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

}
