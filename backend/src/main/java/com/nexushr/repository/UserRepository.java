package com.nexushr.repository;

import com.nexushr.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndDeletedFalse(String email);

    boolean existsByEmailAndDeletedFalse(String email);

    boolean existsByEmployeeId(String employeeId);

    Optional<User> findByPasswordResetTokenAndDeletedFalse(String token);

    Optional<User> findByRefreshTokenAndDeletedFalse(String refreshToken);

    List<User> findByRoleInAndDeletedFalse(List<User.UserRole> roles);

    List<User> findByRoleAndDeletedFalse(User.UserRole role);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    // Bulk clear refresh tokens (used during security incidents)
    @Modifying
    @Query("UPDATE User u SET u.refreshToken = NULL WHERE u.role = :role AND u.deleted = false")
    int clearRefreshTokensByRole(@Param("role") User.UserRole role);

    long countByDeletedFalse();

    long countByRoleAndDeletedFalse(User.UserRole role);

    long countByStatusAndDeletedFalse(User.UserStatus status);
}
