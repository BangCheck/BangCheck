package com.room.backend.feature.roomdetail.adapter.persistence;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.feature.roomdetail.application.port.ChecklistResultDetailsLookup;
import com.room.backend.feature.roomdetail.domain.ChecklistResultDetails;
import com.room.backend.feature.roomdetail.domain.ChecklistResultDetails.SelectedOptionDetails;
import com.room.backend.global.common.exception.ChecklistErrorCode;
import com.room.backend.global.common.exception.GeneralException;
import java.util.List;

/** legacy RoomCheckResultService.getCheckResults의 조회 순서와 실패 계약을 보존한다. */
public final class JpaChecklistResultDetailsLookup implements ChecklistResultDetailsLookup {
    private final RoomCheckResultRepository resultRepository;
    private final RoomCheckSelectedOptionRepository selectedOptionRepository;
    private final ChecklistItemRepository itemRepository;
    private final ChecklistOptionRepository optionRepository;

    public JpaChecklistResultDetailsLookup(
            RoomCheckResultRepository resultRepository,
            RoomCheckSelectedOptionRepository selectedOptionRepository,
            ChecklistItemRepository itemRepository,
            ChecklistOptionRepository optionRepository) {
        this.resultRepository = resultRepository;
        this.selectedOptionRepository = selectedOptionRepository;
        this.itemRepository = itemRepository;
        this.optionRepository = optionRepository;
    }

    @Override
    public List<ChecklistResultDetails> findByRoomId(long roomId) {
        return resultRepository.findByRoomId(roomId).stream().map(result -> {
            ChecklistItem item = itemRepository.findById(result.getItemId())
                    .orElseThrow(() -> new GeneralException(ChecklistErrorCode.CHECKLIST_ITEM_NOT_FOUND));
            List<SelectedOptionDetails> selectedOptions = selectedOptionRepository
                    .findByResultId(result.getId()).stream().map(selected -> {
                        ChecklistOption option = optionRepository.findById(selected.getOptionId())
                                .orElseThrow(() -> new GeneralException(ChecklistErrorCode.CHECKLIST_OPTION_NOT_FOUND));
                        return new SelectedOptionDetails(option.getId(), option.getOptionValue());
                    }).toList();
            return new ChecklistResultDetails(
                    result.getId(), result.getRoomId(), result.getItemId(), item.getItemName(),
                    result.getValueText(), result.getValueNumber(), selectedOptions);
        }).toList();
    }
}
