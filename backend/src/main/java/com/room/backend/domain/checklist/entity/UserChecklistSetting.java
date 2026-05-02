package com.room.backend.domain.checklist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "user_checklist_settings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "item_id"}))
public class UserChecklistSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static UserChecklistSetting of(Long userId, Long itemId, Boolean isEnabled) {
        return UserChecklistSetting.builder()
                .userId(userId)
                .itemId(itemId)
                .isEnabled(isEnabled)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public void toggle() {
        this.isEnabled = !this.isEnabled;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
        this.updatedAt = LocalDateTime.now();
    }
}
