package com.nexushr.service;

import com.nexushr.dto.request.EmployeeRequest;
import com.nexushr.dto.response.EmployeeResponse;
import com.nexushr.dto.response.PageResponse;
import com.nexushr.entity.Department;
import com.nexushr.entity.Employee;
import com.nexushr.entity.User;
import com.nexushr.exception.DuplicateResourceException;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.DepartmentRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.UserRepository;
import com.nexushr.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    @CacheEvict(value = "employees", allEntries = true)
    public EmployeeResponse createEmployee(UUID userId, EmployeeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (employeeRepository.findByUserIdAndDeletedFalse(userId).isPresent()) {
            throw new DuplicateResourceException("Employee profile already exists for this user");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", request.getManagerId()));
        }

        Employee employee = Employee.builder()
                .user(user)
                .employeeId(user.getEmployeeId())
                .department(department)
                .jobTitle(request.getJobTitle())
                .jobLevel(request.getJobLevel())
                .manager(manager)
                .hireDate(request.getHireDate())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .nationality(request.getNationality())
                .nationalId(request.getNationalId())
                .address(request.getAddress())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .baseSalary(request.getBaseSalary())
                .currency(request.getCurrency())
                .employmentType(request.getEmploymentType())
                .skills(request.getSkills())
                .bio(request.getBio())
                .linkedinUrl(request.getLinkedinUrl())
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();

        employee = employeeRepository.save(employee);
        auditService.log("EMPLOYEE_CREATED", "Employee", employee.getId().toString(), null, employee.getEmployeeId(), "New employee profile created");

        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "employees", key = "#id")
    public EmployeeResponse getEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getAllEmployees(int page, int size, String search, String sortBy, String sortDir) {
        String safeSortBy = List.of("createdAt", "jobTitle", "employeeId").contains(sortBy) ? sortBy : "createdAt";
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(safeSortBy).descending()
                : Sort.by(safeSortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Employee> employees;
        if (search != null && !search.isBlank()) {
            employees = employeeRepository.searchEmployees(search, pageable);
        } else {
            employees = employeeRepository.findByDeletedFalse(pageable);
        }

        return PageResponse.of(employees.map(this::mapToResponse));
    }

    @Transactional
    @CacheEvict(value = "employees", key = "#id")
    public EmployeeResponse updateEmployee(UUID id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            employee.setDepartment(department);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", request.getManagerId()));
            employee.setManager(manager);
        }

        if (request.getJobTitle() != null) employee.setJobTitle(request.getJobTitle());
        if (request.getJobLevel() != null) employee.setJobLevel(request.getJobLevel());
        if (request.getBaseSalary() != null) employee.setBaseSalary(request.getBaseSalary());
        if (request.getSkills() != null) employee.setSkills(request.getSkills());
        if (request.getBio() != null) employee.setBio(request.getBio());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getEmploymentType() != null) employee.setEmploymentType(request.getEmploymentType());

        employee = employeeRepository.save(employee);
        auditService.log("EMPLOYEE_UPDATED", "Employee", employee.getId().toString(), null, employee.getEmployeeId(), "Employee profile updated");

        return mapToResponse(employee);
    }

    @Transactional
    @CacheEvict(value = "employees", key = "#id")
    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.softDelete();
        employeeRepository.save(employee);
        auditService.log("EMPLOYEE_DELETED", "Employee", id.toString(), null, null, "Employee soft deleted");
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByUserId(UUID userId) {
        Employee employee = employeeRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user"));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getByDepartment(UUID deptId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Employee> employees = employeeRepository.findByDepartmentId(deptId, pageable);
        return PageResponse.of(employees.map(this::mapToResponse));
    }

    public EmployeeResponse mapToResponse(Employee employee) {
        User user = employee.getUser();
        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .jobTitle(employee.getJobTitle())
                .jobLevel(employee.getJobLevel())
                .department(employee.getDepartment() != null ? EmployeeResponse.DepartmentInfo.builder()
                        .id(employee.getDepartment().getId())
                        .name(employee.getDepartment().getName())
                        .code(employee.getDepartment().getCode())
                        .build() : null)
                .manager(employee.getManager() != null ? EmployeeResponse.ManagerInfo.builder()
                        .id(employee.getManager().getId())
                        .employeeId(employee.getManager().getEmployeeId())
                        .fullName(employee.getManager().getUser().getFullName())
                        .jobTitle(employee.getManager().getJobTitle())
                        .profileImageUrl(employee.getManager().getUser().getProfileImageUrl())
                        .build() : null)
                .hireDate(employee.getHireDate())
                .dateOfBirth(employee.getDateOfBirth())
                .gender(employee.getGender())
                .nationality(employee.getNationality())
                .address(employee.getAddress())
                .baseSalary(employee.getBaseSalary())
                .currency(employee.getCurrency())
                .employmentType(employee.getEmploymentType())
                .status(employee.getStatus())
                .skills(employee.getSkills())
                .bio(employee.getBio())
                .linkedinUrl(employee.getLinkedinUrl())
                .annualLeaveBalance(employee.getAnnualLeaveBalance())
                .sickLeaveBalance(employee.getSickLeaveBalance())
                .attritionRiskScore(employee.getAttritionRiskScore())
                .engagementScore(employee.getEngagementScore())
                .createdAt(employee.getCreatedAt())
                .build();
    }
}
