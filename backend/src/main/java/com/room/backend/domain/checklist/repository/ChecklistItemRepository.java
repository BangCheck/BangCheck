package com.room.backend.domain.checklist.repository;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.entity.enums.ItemType;
import com.room.backend.domain.checklist.entity.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByItemType(ItemType itemType);

    List<ChecklistItem> findByCategory(ChecklistCategory category);

    @Query("""
            SELECT ci FROM ChecklistItem ci
            WHERE ci.isDeleted = false
            AND (
              ci.itemType = 'DEFAULT'
              OR (ci.itemType = 'USER_TYPE' AND ci.userType IN :userTypes)
              OR (ci.itemType = 'CUSTOM' AND ci.ownerUserId = :userId)
            )
            AND ci.id NOT IN (
              SELECT cs.itemId FROM UserChecklistSetting cs
              WHERE cs.userId = :userId AND cs.isEnabled = false
            )
            ORDER BY ci.displayOrder NULLS LAST, ci.id
            """)
    List<ChecklistItem> findCustomizedItems(@Param("userId") Long userId,
                                             @Param("userTypes") List<UserType> userTypes);

    @Query("""
            SELECT ci FROM ChecklistItem ci
            WHERE ci.isDeleted = false
            AND ci.itemType = 'DEFAULT'
            AND ci.id NOT IN (
              SELECT cs.itemId FROM UserChecklistSetting cs
              WHERE cs.userId = :userId AND cs.isEnabled = false
            )
            ORDER BY ci.displayOrder NULLS LAST, ci.id
            """)
    List<ChecklistItem> findEssentialsOnlyItems(@Param("userId") Long userId);

    @Query("""
            SELECT ci FROM ChecklistItem ci
            WHERE ci.isDeleted = false
            AND (
              ci.itemType = 'DEFAULT'
              OR ci.itemType = 'USER_TYPE'
              OR (ci.itemType = 'CUSTOM' AND ci.ownerUserId = :userId)
            )
            ORDER BY ci.displayOrder NULLS LAST, ci.id
            """)
    List<ChecklistItem> findAllForSettings(@Param("userId") Long userId);
}
