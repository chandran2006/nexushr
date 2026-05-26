package com.nexushr.repository;

import com.nexushr.entity.Payroll;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, UUID> {

    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId ORDER BY p.payPeriodStart DESC")
    Page<Payroll> findByEmployeeIdOrderByPayPeriodStartDesc(@Param("employeeId") UUID employeeId, Pageable pageable);

    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId AND p.payPeriodStart = :start AND p.payPeriodEnd = :end")
    Optional<Payroll> findByEmployeeIdAndPayPeriodStartAndPayPeriodEnd(@Param("employeeId") UUID employeeId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.payPeriodStart >= :start AND p.payPeriodEnd <= :end AND p.status = 'PAID'")
    BigDecimal getTotalPayrollForPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(p) FROM Payroll p WHERE p.status = :status AND p.deleted = false")
    long countByStatus(@Param("status") Payroll.PayrollStatus status);

    Page<Payroll> findByStatusOrderByCreatedAtDesc(Payroll.PayrollStatus status, Pageable pageable);
}
