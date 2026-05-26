package com.nexushr.repository;

import com.nexushr.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId ORDER BY l.createdAt DESC")
    Page<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") UUID employeeId, Pageable pageable);

    @Query("SELECT l FROM LeaveRequest l WHERE l.status = 'PENDING' AND l.deleted = false ORDER BY l.createdAt ASC")
    List<LeaveRequest> findPendingRequests();

    long countByStatusAndDeletedFalse(LeaveRequest.LeaveStatus status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.id = :empId AND l.status = :status AND l.deleted = false")
    long countByEmployeeAndStatus(@Param("empId") UUID empId, @Param("status") LeaveRequest.LeaveStatus status);
}
