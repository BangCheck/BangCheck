package com.room.backend.domain.checklist.repository;

import com.room.backend.domain.checklist.entity.UserTypeSelection;
import com.room.backend.domain.checklist.entity.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTypeSelectionRepository extends JpaRepository<UserTypeSelection, Long> {
    List<UserTypeSelection> findByUserId(Long userId);
    Optional<UserTypeSelection> findByUserIdAndUserType(Long userId, UserType userType);
    void deleteByUserIdAndUserType(Long userId, UserType userType);
}
