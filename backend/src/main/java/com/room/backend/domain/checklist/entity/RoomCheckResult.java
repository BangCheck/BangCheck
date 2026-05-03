package com.room.backend.domain.checklist.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
@EntityListeners(AuditingEntityListener.class)
@Table(name = "room_check_results")
public class RoomCheckResult {
    
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "value_text")
    private String valueText;

    @Column(name = "value_number", precision = 10, scale = 2)
    private BigDecimal valueNumber;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static RoomCheckResult create(Long roomId, Long itemId, String valueText, BigDecimal valueNumber) {
        
        RoomCheckResult checkResult = new RoomCheckResult();
        
        checkResult.roomId = roomId;
        checkResult.itemId = itemId;
        checkResult.valueText = valueText;
        checkResult.valueNumber = valueNumber;

        return checkResult;
    }



}
