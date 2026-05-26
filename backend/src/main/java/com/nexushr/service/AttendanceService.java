package com.nexushr.service;

import com.nexushr.entity.Attendance;
import com.nexushr.entity.Employee;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SecurityUtils securityUtils;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository,
                             SecurityUtils securityUtils) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public Attendance clockIn(UUID employeeId, String ipAddress, String location) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate today = LocalDate.now();
        attendanceRepository.findByEmployeeIdAndDate(employeeId, today).ifPresent(a -> {
            if (a.getClockIn() != null) throw new IllegalStateException("Already clocked in today");
        });

        LocalTime now = LocalTime.now();
        Attendance.AttendanceStatus status = now.isAfter(LocalTime.of(9, 15))
                ? Attendance.AttendanceStatus.LATE
                : Attendance.AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .employee(employee).date(today).clockIn(now)
                .status(status).ipAddress(ipAddress).location(location)
                .build();

        attendance = attendanceRepository.save(attendance);
        broadcastAttendanceUpdate(employee, "CLOCK_IN");
        return attendance;
    }

    @Transactional
    public Attendance clockOut(UUID employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No clock-in record found for today"));

        if (attendance.getClockOut() != null) throw new IllegalStateException("Already clocked out today");

        LocalTime clockOut = LocalTime.now();
        attendance.setClockOut(clockOut);
        double workHours = ChronoUnit.MINUTES.between(attendance.getClockIn(), clockOut) / 60.0;
        attendance.setWorkHours(Math.round(workHours * 100.0) / 100.0);
        if (workHours > 8.0) attendance.setOvertimeHours(Math.round((workHours - 8.0) * 100.0) / 100.0);

        attendance = attendanceRepository.save(attendance);
        broadcastAttendanceUpdate(attendance.getEmployee(), "CLOCK_OUT");
        return attendance;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTodayStats() {
        LocalDate today = LocalDate.now();
        Map<String, Object> stats = new HashMap<>();
        stats.put("present", attendanceRepository.countPresentByDate(today));
        stats.put("absent", attendanceRepository.countAbsentByDate(today));
        stats.put("late", attendanceRepository.countLateByDate(today));
        stats.put("date", today);
        return stats;
    }

    @Transactional(readOnly = true)
    public List<Attendance> getEmployeeAttendance(UUID employeeId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByEmployeeAndDateRange(employeeId, start, end);
    }

    private void broadcastAttendanceUpdate(Employee employee, String action) {
        if (messagingTemplate == null) return;
        Map<String, Object> update = new HashMap<>();
        update.put("action", action);
        update.put("employeeId", employee.getId());
        update.put("employeeName", employee.getUser().getFullName());
        update.put("timestamp", LocalTime.now());
        messagingTemplate.convertAndSend("/topic/attendance", update);
    }
}
