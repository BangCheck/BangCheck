package com.room.backend.domain.checklist.entity;

import java.math.BigDecimal;

import com.room.backend.global.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "room_check_results")
public class RoomCheckResult extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "value_text")
    private String valueText;

    @Column(name = "value_number", precision = 10, scale = 2)
    private BigDecimal valueNumber;

    public static RoomCheckResult create(Long roomId, Long itemId, String valueText, BigDecimal valueNumber) {
        RoomCheckResult checkResult = new RoomCheckResult();
        checkResult.roomId = roomId;
        checkResult.itemId = itemId;
        checkResult.valueText = valueText;
        checkResult.valueNumber = valueNumber;
        return checkResult;
    }
}
