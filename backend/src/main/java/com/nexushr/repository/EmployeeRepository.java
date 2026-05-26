package com.nexushr.repository;

import com.nexushr.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Page<Employee> findByDeletedFalse(Pageable pageable);

    Optional<Employee> findByEmployeeIdAndDeletedFalse(String employeeId);

    Optional<Employee> findByUserIdAndDeletedFalse(UUID userId);

    boolean existsByEmployeeIdAndDeletedFalse(String employeeId);

    @Query("SELECT e FROM Employee e JOIN e.user u WHERE e.deleted = false AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> searchEmployees(@Param("search") String search, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.deleted = false AND e.department.id = :deptId")
    Page<Employee> findByDepartmentId(@Param("deptId") UUID deptId, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.deleted = false AND e.status = :status")
    Page<Employee> findByStatus(@Param("status") Employee.EmployeeStatus status, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.deleted = false AND e.status = :status")
    List<Employee> findAllByStatusAndDeletedFalse(@Param("status") Employee.EmployeeStatus status);

    @Query("SELECT e FROM Employee e WHERE e.deleted = false AND e.manager.id = :managerId")
    List<Employee> findDirectReports(@Param("managerId") UUID managerId);

    long countByDeletedFalse();

    long countByStatusAndDeletedFalse(Employee.EmployeeStatus status);

    long countByDepartmentIdAndDeletedFalse(UUID departmentId);

    @Query("SELECT e FROM Employee e WHERE e.deleted = false AND e.attritionRiskScore >= :threshold ORDER BY e.attritionRiskScore DESC")
    List<Employee> findHighAttritionRiskEmployees(@Param("threshold") java.math.BigDecimal threshold);

    @Query("SELECT new map(d.name as name, COUNT(e) as value) FROM Employee e JOIN e.department d WHERE e.deleted = false GROUP BY d.name ORDER BY COUNT(e) DESC")
    List<java.util.Map<String, Object>> getDepartmentDistribution();
}
