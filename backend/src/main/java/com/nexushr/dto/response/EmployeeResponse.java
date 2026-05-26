package com.nexushr.dto.response;

import com.nexushr.entity.Employee;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EmployeeResponse {
    private UUID id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profileImageUrl;
    private String jobTitle;
    private String jobLevel;
    private DepartmentInfo department;
    private ManagerInfo manager;
    private LocalDate hireDate;
    private LocalDate dateOfBirth;
    private Employee.Gender gender;
    private String nationality;
    private String address;
    private BigDecimal baseSalary;
    private String currency;
    private Employee.EmploymentType employmentType;
    private Employee.EmployeeStatus status;
    private String skills;
    private String bio;
    private String linkedinUrl;
    private int annualLeaveBalance;
    private int sickLeaveBalance;
    private BigDecimal attritionRiskScore;
    private BigDecimal engagementScore;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class DepartmentInfo {
        private UUID id;
        private String name;
        private String code;
    }

    @Data
    @Builder
    public static class ManagerInfo {
        private UUID id;
        private String employeeId;
        private String fullName;
        private String jobTitle;
        private String profileImageUrl;
    }
}
