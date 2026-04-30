package com.room.backend.domain.checklist.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Builder
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
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
