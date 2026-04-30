package com.room.backend.domain.checklist.repository;

import com.room.backend.domain.checklist.entity.ChecklistOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistOptionRepository extends JpaRepository<ChecklistOption, Long> {
    List<ChecklistOption> findByChecklistItemId(Long checklistItemId);
}
