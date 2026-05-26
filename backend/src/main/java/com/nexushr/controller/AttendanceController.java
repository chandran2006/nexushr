package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.Attendance;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.security.SecurityUtils;
import com.nexushr.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance tracking")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final SecurityUtils securityUtils;
    private final EmployeeRepository employeeRepository;

    private UUID resolveEmployeeId(UUID userId) {
        return employeeRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"))
                .getId();
    }

    @PostMapping("/clock-in")
    @Operation(summary = "Clock in")
    public ResponseEntity<ApiResponse<Attendance>> clockIn(
            @RequestParam(required = false) String location,
            HttpServletRequest request) {
        UUID employeeId = resolveEmployeeId(securityUtils.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Clocked in",
                attendanceService.clockIn(employeeId, request.getRemoteAddr(), location)));
    }

    @PostMapping("/clock-out")
    @Operation(summary = "Clock out")
    public ResponseEntity<ApiResponse<Attendance>> clockOut() {
        UUID employeeId = resolveEmployeeId(securityUtils.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Clocked out", attendanceService.clockOut(employeeId)));
    }

    @GetMapping("/today")
    @Operation(summary = "Today's attendance stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> todayStats() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getTodayStats()));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get employee attendance history")
    public ResponseEntity<ApiResponse<List<Attendance>>> history(
            @PathVariable UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getEmployeeAttendance(employeeId, start, end)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my attendance")
    public ResponseEntity<ApiResponse<List<Attendance>>> myAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        UUID employeeId = resolveEmployeeId(securityUtils.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getEmployeeAttendance(employeeId, start, end)));
    }
}
