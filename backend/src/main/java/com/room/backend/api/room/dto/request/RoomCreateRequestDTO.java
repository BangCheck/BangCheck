package com.room.backend.api.room.dto.request;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class RoomCreateRequestDTO {

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
}
