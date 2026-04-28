package com.room.backend.domain.checklist.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "checklist_options")
public class ChecklistOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_item_id", nullable = false)
    private ChecklistItem checklistItem;

    @Column(nullable = false, length = 100)
    private String value;

    private Integer displayOrder;
}
