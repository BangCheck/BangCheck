package com.room.backend.domain.checklist.entity;

import com.room.backend.domain.checklist.entity.enums.UserType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "user_type_selections",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "user_type"}))
public class UserTypeSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 30)
    private UserType userType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static UserTypeSelection of(Long userId, UserType userType) {
        return UserTypeSelection.builder()
                .userId(userId)
                .userType(userType)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
