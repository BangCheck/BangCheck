package com.room.backend.domain.user.repository;

import com.room.backend.domain.user.entity.User;
import com.room.backend.domain.user.entity.enums.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByProviderAndProviderId(Provider provider, String providerId);

    Optional<User> findByProviderAndProviderIdAndIsDeletedFalse(Provider provider, String providerId);

    Optional<User> findByProviderAndProviderIdAndIsDeletedTrue(Provider provider, String providerId);
}
