package com.nexushr.repository;

import com.nexushr.entity.Goal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {

    @Query("SELECT g FROM Goal g WHERE g.employee.id = :employeeId ORDER BY g.createdAt DESC")
    Page<Goal> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") UUID employeeId, Pageable pageable);

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.employee.id = :employeeId AND g.status = :status")
    long countByEmployeeIdAndStatus(@Param("employeeId") UUID employeeId, @Param("status") Goal.GoalStatus status);
}
