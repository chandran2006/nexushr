package com.nexushr.dto.request;

import com.nexushr.entity.Employee;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class EmployeeRequest {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String jobLevel;

    @NotNull(message = "Department is required")
    private UUID departmentId;

    private UUID managerId;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    private LocalDate dateOfBirth;
    private Employee.Gender gender;
    private String nationality;
    private String nationalId;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private BigDecimal baseSalary;
    private String currency = "USD";
    private Employee.EmploymentType employmentType;
    private String skills;
    private String bio;
    private String linkedinUrl;
}
