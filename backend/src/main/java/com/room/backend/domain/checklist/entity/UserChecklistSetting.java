package com.room.backend.domain.checklist.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_checklist_settings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "item_id"}))
public class UserChecklistSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;                          // 논리적 FK (물리적 연결 없음)

    @Column(name = "item_id", nullable = false)
    private Long itemId;                          // 논리적 FK (물리적 연결 없음)

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public UserChecklistSetting(Long userId, Long itemId, Boolean isEnabled) {
        this.userId = userId;
        this.itemId = itemId;
        this.isEnabled = isEnabled;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ON/OFF 토글
    public void toggle() {
        this.isEnabled = !this.isEnabled;
        this.updatedAt = LocalDateTime.now();
    }

    // 명시적 설정
    public void updateEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
        this.updatedAt = LocalDateTime.now();
    }
}
