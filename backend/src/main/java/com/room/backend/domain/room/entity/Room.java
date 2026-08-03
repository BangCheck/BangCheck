package com.room.backend.domain.room.entity;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.MaintenanceStatus;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import com.room.backend.global.common.entity.BaseEntity;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.RoomErrorCode;
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
    @Column(name = "rent_type", length = 20)
    private RentType rentType;

    private Long deposit;

    @Column(name = "monthly_rent")
    private Integer monthlyRent;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_status", length = 20)
    private MaintenanceStatus maintenanceStatus;

    @Column(name = "maintenance_fee")
    private Integer maintenanceFee;

    @Column(name = "is_management_fee_unknown")
    private Boolean isManagementFeeUnknown = false;

    @Column(name = "has_loan")
    Boolean hasLoan;

    @Column(name = "loan_amount")
    private Long loanAmount;

    @Column(name = "can_register_address")
    private Boolean canRegisterAddress;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "is_move_in_date_negotiable")
    private Boolean isMoveInDateNegotiable;

    @Enumerated(EnumType.STRING)
    private BuildingType buildingType;

    private Integer floor;

    @Column(name = "has_elevator")
    private Boolean hasElevator;

    @Column(name = "has_parking")
    private Boolean hasParking;

    @Enumerated(EnumType.STRING)
    @Column(name = "special_floor", length = 20)
    private SpecialFloor specialFloor;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
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
            SpecialFloor specialFloor,
            Direction direction,
            String memo
    ) {
        if (rentType == RentType.JEONSE) {
            if (deposit == null) {
                throw new GeneralException(RoomErrorCode.JEONSE_DEPOSIT_REQUIRED);
            }
            rent = null;
        }

        if (rentType == RentType.MONTHLY) {
            if (rent == null) {
                throw new GeneralException(RoomErrorCode.MONTHLY_RENT_REQUIRED);
            }
        }

        if (hasLoan == null || !hasLoan) {
            loanAmount = null;
        } else {
            if (loanAmount == null) {
                throw new GeneralException(RoomErrorCode.LOAN_AMOUNT_REQUIRED);
            }
        }

        boolean managementFeeUnknown = Boolean.TRUE.equals(isManagementFeeUnknown);
        MaintenanceStatus derived = managementFeeUnknown ? MaintenanceStatus.UNKNOWN :
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
        room.maintenanceFee = managementFeeUnknown ? null : managementFee;
        room.isManagementFeeUnknown = isManagementFeeUnknown != null ? isManagementFeeUnknown : false;
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

    /** 수정 가능한 값을 하나의 불변 명령으로 묶어 부분 인자 누락과 순서 오류를 막는다. */
    public void update(UpdateValues values, BigDecimal lat, BigDecimal lon) {
        this.name = values.name();
        if (values.address() != null) {
            this.address = values.address();
            this.lat = lat;
            this.lon = lon;
        }
        this.rentType = values.rentType();
        this.deposit = values.deposit();
        this.monthlyRent = values.rent();
        this.isManagementFeeUnknown = values.managementFeeUnknown() != null ? values.managementFeeUnknown() : false;
        this.maintenanceFee = values.managementFee();
        this.maintenanceStatus = this.isManagementFeeUnknown ? MaintenanceStatus.UNKNOWN :
                (this.maintenanceFee != null ? MaintenanceStatus.INCLUDED : MaintenanceStatus.NONE);
        this.hasLoan = values.hasLoan();
        this.loanAmount = values.loanAmount();
        this.canRegisterAddress = values.canRegisterAddress();
        this.availableFrom = values.moveInDate();
        this.isMoveInDateNegotiable = values.moveInDateNegotiable();
        this.buildingType = values.buildingType();
        this.floor = values.floor();
        this.hasElevator = values.hasElevator();
        this.hasParking = values.hasParking();
        this.specialFloor = values.specialFloor();
        this.direction = values.direction();
        this.memo = values.memo();
    }

    public record UpdateValues(
            String name, String address, RentType rentType, Long deposit, Integer rent,
            Boolean managementFeeUnknown, Integer managementFee, Boolean hasLoan, Long loanAmount,
            Boolean canRegisterAddress, LocalDate moveInDate, Boolean moveInDateNegotiable,
            BuildingType buildingType, Integer floor, Boolean hasElevator, Boolean hasParking,
            SpecialFloor specialFloor, Direction direction, String memo) { }
}
