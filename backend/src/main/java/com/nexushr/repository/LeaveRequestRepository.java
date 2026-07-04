package com.nexushr.repository;

import com.nexushr.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.employee e JOIN FETCH e.user " +
           "WHERE l.employee.id = :employeeId AND l.deleted = false ORDER BY l.createdAt DESC")
    Page<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") UUID employeeId,
                                                             Pageable pageable);

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.employee e JOIN FETCH e.user " +
           "WHERE l.status = 'PENDING' AND l.deleted = false ORDER BY l.createdAt ASC")
    List<LeaveRequest> findPendingRequests();

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.employee e JOIN FETCH e.user " +
           "WHERE l.employee.department.id = :deptId AND l.status = 'PENDING' " +
           "AND l.deleted = false ORDER BY l.createdAt ASC")
    List<LeaveRequest> findPendingByDepartment(@Param("deptId") UUID deptId);

    long countByStatusAndDeletedFalse(LeaveRequest.LeaveStatus status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = :status " +
           "AND l.approvedAt BETWEEN :start AND :end AND l.deleted = false")
    long countByStatusAndApprovedAtBetween(@Param("status") LeaveRequest.LeaveStatus status,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.id = :empId " +
           "AND l.status = :status AND l.deleted = false")
    long countByEmployeeAndStatus(@Param("empId") UUID empId,
                                   @Param("status") LeaveRequest.LeaveStatus status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.id = :empId " +
           "AND l.startDate <= :date AND l.endDate >= :date " +
           "AND l.status = 'APPROVED' AND l.deleted = false")
    long countActiveLeaveOnDate(@Param("empId") UUID empId, @Param("date") java.time.LocalDate date);
}
