package com.room.backend.domain.checklist.repository;

import com.room.backend.domain.checklist.entity.UserChecklistSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChecklistSettingRepository extends JpaRepository<UserChecklistSetting, Long> {
    List<UserChecklistSetting> findByUserId(Long userId);
    Optional<UserChecklistSetting> findByUserIdAndItemId(Long userId, Long itemId);
    void deleteByUserIdAndItemId(Long userId, Long itemId);
    List<UserChecklistSetting> findByUserIdAndIsEnabledFalse(Long userId);
    void deleteByUserId(Long userId);
}
