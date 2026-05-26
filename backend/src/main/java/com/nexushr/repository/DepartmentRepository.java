package com.nexushr.repository;

import com.nexushr.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByCodeAndDeletedFalse(String code);

    boolean existsByCodeAndDeletedFalse(String code);

    List<Department> findByDeletedFalseOrderByNameAsc();

    @Query("SELECT d FROM Department d WHERE d.deleted = false AND d.parentDepartment IS NULL ORDER BY d.name ASC")
    List<Department> findRootDepartments();

    long countByDeletedFalse();
}
