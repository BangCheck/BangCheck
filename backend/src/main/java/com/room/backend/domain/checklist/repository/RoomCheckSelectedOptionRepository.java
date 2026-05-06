package com.room.backend.domain.checklist.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;

public interface RoomCheckSelectedOptionRepository extends JpaRepository<RoomCheckSelectedOption, Long> {
    List<RoomCheckSelectedOption> findByResultId(Long resultId);
    void deleteByResultId(Long resultId);
}
