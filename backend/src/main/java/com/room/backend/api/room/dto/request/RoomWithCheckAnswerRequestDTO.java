package com.room.backend.api.room.dto.request;

import java.util.ArrayList;
import java.util.List;

import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.domain.room.entity.enums.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
/** 평면 JSON 계약을 유지하면서 코드 재사용 목적의 DTO 상속을 제거했다. */
public class RoomWithCheckAnswerRequestDTO {
    @NotBlank(message = "방 이름은 필수입니다.")
    private String name;
    @NotBlank(message = "주소는 필수입니다.")
    private String address;
    private RentType rentType;
    private Long deposit;
    private Integer rent;
    private Integer managementFee;
    private Boolean isManagementFeeUnknown;
    private Boolean hasLoan;
    private Long loanAmount;
    private Boolean canRegisterAddress;
    private LocalDate moveInDate;
    private Boolean isMoveInDateNegotiable;
    private BuildingType buildingType;
    private Integer floor;
    private Boolean hasElevator;
    private Boolean hasParking;
    private SpecialFloor specialFloor;
    private Direction direction;
    private String memo;
    private List<RoomCheckAnswerRequestDTO> checkAnswers = new ArrayList<>();
    
}
