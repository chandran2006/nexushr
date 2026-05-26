package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.LeaveRequest;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.security.SecurityUtils;
import com.nexushr.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Leave requests and approvals")
public class LeaveController {

    private final LeaveService leaveService;
    private final SecurityUtils securityUtils;
    private final EmployeeRepository employeeRepository;

    @Data
    static class LeaveApplyRequest {
        @NotNull private LeaveRequest.LeaveType leaveType;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        private String reason;
    }

    private UUID resolveEmployeeId(UUID userId) {
        return employeeRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"))
                .getId();
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply for leave")
    public ResponseEntity<ApiResponse<LeaveRequest>> apply(@Valid @RequestBody LeaveApplyRequest req) {
        UUID employeeId = resolveEmployeeId(securityUtils.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Leave applied",
                leaveService.applyLeave(employeeId, req.getLeaveType(), req.getStartDate(), req.getEndDate(), req.getReason())));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Get pending leave requests")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> pending() {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getPendingRequests()));
    }

    @PutMapping("/{id}/process")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Approve or reject leave")
    public ResponseEntity<ApiResponse<LeaveRequest>> process(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        var approver = securityUtils.getCurrentUser();
        LeaveRequest.LeaveStatus status = LeaveRequest.LeaveStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Leave processed",
                leaveService.processLeave(id, status, approver, body.get("notes"))));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my leave requests")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> myLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID employeeId = resolveEmployeeId(securityUtils.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success(leaveService.getEmployeeLeaves(employeeId, page, size)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Get employee leave history")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> employeeLeaves(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getEmployeeLeaves(employeeId, page, size)));
    }
}
