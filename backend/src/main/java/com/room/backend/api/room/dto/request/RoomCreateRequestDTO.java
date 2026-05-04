package com.room.backend.api.room.dto.request;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "거래유형은 필수입니다.")
    private RentType rentType;

    private Long deposit;
    private Integer rent;
    private Integer managementFee;

    @NotNull(message = "관리비 모름 여부는 필수입니다.")
    private Boolean isManagementFeeUnknown;

    @NotNull(message = "융자 여부는 필수입니다.")
    private Boolean hasLoan;

    private Long loanAmount;

    @NotNull(message = "주소 등록 가능 여부는 필수입니다.")
    private Boolean canRegisterAddress;

    private LocalDate moveInDate;
    private Boolean isMoveInDateNegotiable;

    @NotNull(message = "건물 유형은 필수입니다.")
    private BuildingType buildingType;

    private Integer floor;

    @NotNull(message = "엘리베이터 여부는 필수입니다.")
    private Boolean hasElevator;

    private Boolean hasParking;
    private SpecialFloor specialFloor;

    @NotNull(message = "방향은 필수입니다.")
    private Direction direction;

    private String memo;
}
