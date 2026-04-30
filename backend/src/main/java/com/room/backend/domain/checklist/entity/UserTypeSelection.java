package com.room.backend.domain.checklist.entity;

import com.room.backend.domain.checklist.entity.enums.UserType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_type_selections",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "user_type"}))
public class UserTypeSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;                          // 논리적 FK (물리적 연결 없음)

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 30)
    private UserType userType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public UserTypeSelection(Long userId, UserType userType) {
        this.userId = userId;
        this.userType = userType;
        this.createdAt = LocalDateTime.now();
    }
}
