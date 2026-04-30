package com.room.backend.domain.checklist.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "checklist_options")
public class ChecklistOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="checklist_item_id", nullable = false)
    private Long checklistItemId;

    @Column(nullable = false, length = 100)
    private String optionValue;

    @Column
    private Integer displayOrder;
}
