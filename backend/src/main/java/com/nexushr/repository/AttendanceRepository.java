package com.nexushr.repository;

import com.nexushr.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND a.date = :date")
    Optional<Attendance> findByEmployeeIdAndDate(@Param("employeeId") UUID employeeId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :empId AND a.date BETWEEN :start AND :end ORDER BY a.date DESC")
    List<Attendance> findByEmployeeAndDateRange(@Param("empId") UUID empId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'PRESENT'")
    long countPresentByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'ABSENT'")
    long countAbsentByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'LATE'")
    long countLateByDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.date = :date ORDER BY a.clockIn ASC")
    List<Attendance> findByDate(@Param("date") LocalDate date);

    @Query("SELECT AVG(a.workHours) FROM Attendance a WHERE a.employee.id = :empId AND a.date BETWEEN :start AND :end")
    Double getAverageWorkHours(@Param("empId") UUID empId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
