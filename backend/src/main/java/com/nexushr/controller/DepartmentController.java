package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.Department;
import com.nexushr.exception.DuplicateResourceException;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    @Operation(summary = "List all departments")
    public ResponseEntity<ApiResponse<List<Department>>> list() {
        return ResponseEntity.ok(ApiResponse.success(departmentRepository.findByDeletedFalseOrderByNameAsc()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<Department>> get(@PathVariable UUID id) {
        Department dept = departmentRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return ResponseEntity.ok(ApiResponse.success(dept));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    @Operation(summary = "Create department")
    public ResponseEntity<ApiResponse<Department>> create(@RequestBody Map<String, String> body) {
        if (departmentRepository.existsByCodeAndDeletedFalse(body.get("code"))) {
            throw new DuplicateResourceException("Department code already exists: " + body.get("code"));
        }
        Department dept = Department.builder()
                .name(body.get("name"))
                .code(body.get("code").toUpperCase())
                .description(body.get("description"))
                .location(body.get("location"))
                .build();
        return ResponseEntity.ok(ApiResponse.success("Department created", departmentRepository.save(dept)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    @Operation(summary = "Update department")
    public ResponseEntity<ApiResponse<Department>> update(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        Department dept = departmentRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        if (body.containsKey("name")) dept.setName(body.get("name"));
        if (body.containsKey("description")) dept.setDescription(body.get("description"));
        if (body.containsKey("location")) dept.setLocation(body.get("location"));
        return ResponseEntity.ok(ApiResponse.success("Department updated", departmentRepository.save(dept)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    @Operation(summary = "Delete department")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        Department dept = departmentRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        dept.softDelete();
        departmentRepository.save(dept);
        return ResponseEntity.ok(ApiResponse.success("Department deleted", null));
    }
}
