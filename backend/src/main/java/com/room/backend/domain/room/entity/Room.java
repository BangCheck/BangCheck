package com.room.backend.domain.room.entity;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.MaintenanceStatus;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name="rooms")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RentType rentType;

    @Column
    private Long deposit;
    @Column
    private Integer monthlyRent;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus maintenanceStatus;
    @Column
    private Integer maintenanceFee;

    @Column(nullable = false)
    Boolean hasLoan;
    @Column
    private Long loanAmount;

    @Column(nullable = false)
    private Boolean canRegisterAddress;
    @Column
    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BuildingType buildingType;

    @Column
    private Integer floor;
    @Column(nullable = false)
    private Boolean hasElevator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Direction direction;

    @Column(length = 1000)
    private String memo;


    public static Room create(
            Long userId,
            String address,
            RentType rentType,
            Long deposit,
            Integer monthlyRent,
            MaintenanceStatus maintenanceStatus,
            Integer maintenanceFee,
            Boolean hasLoan,
            Long loanAmount,
            Boolean canRegisterAddress,
            LocalDate availableFrom,
            BuildingType buildingType,
            Integer floor,
            Boolean hasElevator,
            Direction direction,
            String memo
    ){
        if (rentType == RentType.JEONSE) {
            if (deposit == null) {
                throw new IllegalArgumentException("전세는 보증금이 필수입니다.");
            }
            monthlyRent = null;
        }

        if (rentType == RentType.MONTHLY) {
            if (monthlyRent == null) {
                throw new IllegalArgumentException("월세는 월세 금액이 필수입니다.");
            }
        }

        if (maintenanceStatus == MaintenanceStatus.NONE) {
            maintenanceFee = null;
        } else if (maintenanceStatus == MaintenanceStatus.INCLUDED) {
            if (maintenanceFee == null) {
                throw new IllegalArgumentException("관리비가 있는 경우 금액은 필수입니다.");
            }
        } else if (maintenanceStatus == MaintenanceStatus.UNKNOWN) {
            maintenanceFee = null;
        }

        if (!hasLoan) {
            loanAmount = null;
        } else {
            if (loanAmount == null) {
                throw new IllegalArgumentException("융자가 있는 경우 금액은 필수입니다.");
            }
        }

        Room room = new Room();
        room.userId = userId;
        room.address = address;
        room.rentType = rentType;
        room.deposit = deposit;
        room.monthlyRent = monthlyRent;
        room.maintenanceStatus = maintenanceStatus;
        room.maintenanceFee = maintenanceFee;
        room.hasLoan = hasLoan;
        room.loanAmount = loanAmount;
        room.canRegisterAddress = canRegisterAddress;
        room.availableFrom = availableFrom;
        room.buildingType = buildingType;
        room.floor = floor;
        room.hasElevator = hasElevator;
        room.direction = direction;
        room.memo = memo;

        return room;
    }
}
