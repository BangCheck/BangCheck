package com.room.backend.feature.roomregistration.adapter.web;

import com.room.backend.api.room.dto.request.RoomWithCheckAnswerRequestDTO;
import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.feature.roomregistration.application.RegisterRoomCommand;
import com.room.backend.feature.roomregistration.domain.ChecklistAnswer;

import java.util.ArrayList;
import java.util.List;

/**
 * 기존 요청 DTO를 slice의 command로 옮긴다.
 *
 * <p>[경계] legacy DTO는 그대로 둔다. Bean Validation의 {@code @NotBlank} 메시지가 응답 계약
 * ({@code COMMON_400_VALIDATION}, {@code [name] 방 이름은 필수입니다.})을 만들고 있으므로
 * DTO를 교체하면 그 메시지가 바뀐다. command는 검증을 통과한 값만 받는다.
 *
 * <p>[계약 보존] 방어 복사에 {@code List.copyOf}를 쓰지 않는다. null 원소가 있으면 NPE가 나고
 * legacy의 HTTP 409가 HTTP 500으로 바뀐다. null은 legacy와 동일하게 DB 제약까지 내려보낸다.
 */
public final class RoomRegistrationRequestMapper {

    private RoomRegistrationRequestMapper() {
    }

    public static RegisterRoomCommand toCommand(RoomWithCheckAnswerRequestDTO request, long ownerId) {
        return new RegisterRoomCommand(
                ownerId,
                request.getName(),
                request.getAddress(),
                request.getRentType(),
                request.getDeposit(),
                request.getRent(),
                request.getIsManagementFeeUnknown(),
                request.getManagementFee(),
                request.getHasLoan(),
                request.getLoanAmount(),
                request.getCanRegisterAddress(),
                request.getMoveInDate(),
                request.getIsMoveInDateNegotiable(),
                request.getBuildingType(),
                request.getFloor(),
                request.getHasElevator(),
                request.getHasParking(),
                request.getSpecialFloor(),
                request.getDirection(),
                request.getMemo(),
                toAnswers(request.getCheckAnswers()));
    }

    private static List<ChecklistAnswer> toAnswers(List<RoomCheckAnswerRequestDTO> requested) {
        if (requested == null) {
            return List.of();
        }
        List<ChecklistAnswer> answers = new ArrayList<>(requested.size());
        for (RoomCheckAnswerRequestDTO answer : requested) {
            answers.add(new ChecklistAnswer(
                    answer.getItemId(),
                    answer.getValueText(),
                    answer.getValueNumber(),
                    answer.getSelectedOptionIds()));
        }
        return answers;
    }
}
