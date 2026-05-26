package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.Payroll;
import com.nexushr.security.SecurityUtils;
import com.nexushr.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll management")
public class PayrollController {

    private final PayrollService payrollService;
    private final SecurityUtils securityUtils;

    @PostMapping("/process/{employeeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','FINANCE')")
    @Operation(summary = "Process payroll for employee")
    public ResponseEntity<ApiResponse<Payroll>> process(
            @PathVariable UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        return ResponseEntity.ok(ApiResponse.success("Payroll processed",
                payrollService.processPayroll(employeeId, periodStart, periodEnd)));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','FINANCE')")
    @Operation(summary = "Process bulk payroll")
    public ResponseEntity<ApiResponse<Void>> bulk(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        payrollService.processBulkPayroll(periodStart, periodEnd);
        return ResponseEntity.ok(ApiResponse.success("Bulk payroll processing started", null));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','FINANCE')")
    @Operation(summary = "Approve payroll")
    public ResponseEntity<ApiResponse<Payroll>> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Payroll approved", payrollService.approvePayroll(id)));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','FINANCE')")
    @Operation(summary = "Mark payroll as paid")
    public ResponseEntity<ApiResponse<Payroll>> markPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Payroll marked as paid", payrollService.markAsPaid(id)));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get employee payroll history")
    public ResponseEntity<ApiResponse<Page<Payroll>>> history(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getEmployeePayrolls(employeeId, page, size)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my payroll history")
    public ResponseEntity<ApiResponse<Page<Payroll>>> myPayroll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        var user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(payrollService.getMyPayrolls(user.getId(), page, size)));
    }
}
