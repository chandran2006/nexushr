package com.nexushr.controller;

import com.nexushr.dto.request.EmployeeRequest;
import com.nexushr.dto.response.ApiResponse;
import com.nexushr.dto.response.EmployeeResponse;
import com.nexushr.dto.response.PageResponse;
import com.nexushr.security.SecurityUtils;
import com.nexushr.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Create employee profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @RequestParam UUID userId,
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Employee created", employeeService.createEmployee(userId, request)));
    }

    @GetMapping
    @Operation(summary = "List all employees")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAllEmployees(page, size, search, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<ApiResponse<EmployeeResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployee(id)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my employee profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile() {
        var user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeByUserId(user.getId())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Update employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Employee updated", employeeService.updateEmployee(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    @Operation(summary = "Delete employee")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted", null));
    }

    @GetMapping("/department/{deptId}")
    @Operation(summary = "Get employees by department")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> byDepartment(
            @PathVariable UUID deptId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getByDepartment(deptId, page, size)));
    }
}
