package com.room.backend.domain.checklist.entity;

import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.entity.enums.InputType;
import com.room.backend.domain.checklist.entity.enums.ItemType;
import com.room.backend.domain.checklist.entity.enums.UserType;
import com.room.backend.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Builder
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name="checklist_items")
public class ChecklistItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name="item_name",nullable = false, length = 100)
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ChecklistCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ItemType itemType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InputType inputType;

    @Column(length = 600)
    private String description;

    @Column
    private Integer displayOrder;

    @Column(name = "owner_user_id")
    private Long ownerUserId;  // CUSTOM 항목만 값 있음
}
