package com.nexushr.repository;

import com.nexushr.entity.PerformanceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {

    @Query("SELECT p FROM PerformanceReview p WHERE p.employee.id = :employeeId ORDER BY p.createdAt DESC")
    Page<PerformanceReview> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") UUID employeeId, Pageable pageable);

    @Query("SELECT AVG(p.overallRating) FROM PerformanceReview p WHERE p.employee.id = :empId AND p.status = 'COMPLETED'")
    Double getAverageRatingByEmployee(@Param("empId") UUID empId);

    @Query("SELECT p FROM PerformanceReview p WHERE p.status = 'IN_PROGRESS' ORDER BY p.reviewPeriodEnd ASC")
    List<PerformanceReview> findInProgressReviews();
}
