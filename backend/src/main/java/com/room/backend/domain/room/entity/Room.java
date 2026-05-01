package com.room.backend.domain.room.entity;

import com.room.backend.api.room.dto.request.RoomUpdateRequestDTO;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.MaintenanceStatus;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Entity
@Table(name="rooms")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "lat", precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(name = "lon", precision = 10, scale = 7)
    private BigDecimal lon;

    @Enumerated(EnumType.STRING)
    @Column(name = "rent_type", nullable = false, length = 20)
    private RentType rentType;

    @Column
    private Long deposit;

    @Column(name = "monthly_rent")
    private Integer monthlyRent;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_status", nullable = false, length = 20)
    private MaintenanceStatus maintenanceStatus;

    @Column(name = "maintenance_fee")
    private Integer maintenanceFee;

    @Column(name = "is_management_fee_unknown", nullable = false)
    private Boolean isManagementFeeUnknown = false;

    @Column(name = "has_loan", nullable = false)
    Boolean hasLoan;

    @Column(name = "loan_amount")
    private Long loanAmount;

    @Column(name = "can_register_address", nullable = false)
    private Boolean canRegisterAddress;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "is_move_in_date_negotiable")
    private Boolean isMoveInDateNegotiable;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BuildingType buildingType;

    @Column
    private Integer floor;

    @Column(name = "has_elevator", nullable = false)
    private Boolean hasElevator;

    @Column(name = "has_parking")
    private Boolean hasParking;

    @Column(name = "special_floor", length = 50)
    private String specialFloor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Direction direction;

    @Column(length = 1000)
    private String memo;


    public static Room create(
            Long userId,
            String name,
            String address,
            BigDecimal lat,
            BigDecimal lon,
            RentType rentType,
            Long deposit,
            Integer rent,
            Boolean isManagementFeeUnknown,
            Integer managementFee,
            Boolean hasLoan,
            Long loanAmount,
            Boolean canRegisterAddress,
            LocalDate moveInDate,
            Boolean isMoveInDateNegotiable,
            BuildingType buildingType,
            Integer floor,
            Boolean hasElevator,
            Boolean hasParking,
            String specialFloor,
            Direction direction,
            String memo
    ) {
        if (rentType == RentType.JEONSE) {
            if (deposit == null) {
                throw new IllegalArgumentException("전세는 보증금이 필수입니다.");
            }
            rent = null;
        }

        if (rentType == RentType.MONTHLY) {
            if (rent == null) {
                throw new IllegalArgumentException("월세는 월세 금액이 필수입니다.");
            }
        }

        if (!hasLoan) {
            loanAmount = null;
        } else {
            if (loanAmount == null) {
                throw new IllegalArgumentException("융자가 있는 경우 금액은 필수입니다.");
            }
        }

        MaintenanceStatus derived = isManagementFeeUnknown ? MaintenanceStatus.UNKNOWN :
                (managementFee != null ? MaintenanceStatus.INCLUDED : MaintenanceStatus.NONE);

        Room room = new Room();
        room.userId = userId;
        room.name = name;
        room.address = address;
        room.lat = lat;
        room.lon = lon;
        room.rentType = rentType;
        room.deposit = deposit;
        room.monthlyRent = rent;
        room.maintenanceStatus = derived;
        room.maintenanceFee = isManagementFeeUnknown ? null : managementFee;
        room.isManagementFeeUnknown = isManagementFeeUnknown;
        room.hasLoan = hasLoan;
        room.loanAmount = loanAmount;
        room.canRegisterAddress = canRegisterAddress;
        room.availableFrom = moveInDate;
        room.isMoveInDateNegotiable = isMoveInDateNegotiable;
        room.buildingType = buildingType;
        room.floor = floor;
        room.hasElevator = hasElevator;
        room.hasParking = hasParking;
        room.specialFloor = specialFloor;
        room.direction = direction;
        room.memo = memo;

        return room;
    }

    public void update(RoomUpdateRequestDTO request) {
        this.name = (request.getName() != null) ? request.getName() : this.name;
        this.rentType = (request.getRentType() != null) ? request.getRentType() : this.rentType;
        this.deposit = (request.getDeposit() != null) ? request.getDeposit() : this.deposit;
        this.monthlyRent = (request.getRent() != null) ? request.getRent() : this.monthlyRent;
        this.isManagementFeeUnknown = (request.getIsManagementFeeUnknown() != null) ? request.getIsManagementFeeUnknown() : this.isManagementFeeUnknown;
        this.maintenanceFee = (request.getManagementFee() != null) ? request.getManagementFee() : this.maintenanceFee;
        this.hasLoan = (request.getHasLoan() != null) ? request.getHasLoan() : this.hasLoan;
        this.loanAmount = (request.getLoanAmount() != null) ? request.getLoanAmount() : this.loanAmount;
        this.canRegisterAddress = (request.getCanRegisterAddress() != null) ? request.getCanRegisterAddress() : this.canRegisterAddress;
        this.availableFrom = (request.getMoveInDate() != null) ? request.getMoveInDate() : this.availableFrom;
        this.isMoveInDateNegotiable = (request.getIsMoveInDateNegotiable() != null) ? request.getIsMoveInDateNegotiable() : this.isMoveInDateNegotiable;
        this.buildingType = (request.getBuildingType() != null) ? request.getBuildingType() : this.buildingType;
        this.floor = (request.getFloor() != null) ? request.getFloor() : this.floor;
        this.hasElevator = (request.getHasElevator() != null) ? request.getHasElevator() : this.hasElevator;
        this.hasParking = (request.getHasParking() != null) ? request.getHasParking() : this.hasParking;
        this.specialFloor = (request.getSpecialFloor() != null) ? request.getSpecialFloor() : this.specialFloor;
        this.direction = (request.getDirection() != null) ? request.getDirection() : this.direction;
        this.memo = (request.getMemo() != null) ? request.getMemo() : this.memo;
    }
}
