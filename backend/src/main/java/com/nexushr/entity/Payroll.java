package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll", indexes = {
    @Index(name = "idx_payroll_employee", columnList = "employee_id"),
    @Index(name = "idx_payroll_period", columnList = "pay_period_start, pay_period_end"),
    @Index(name = "idx_payroll_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;

    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;

    @Column(name = "basic_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "housing_allowance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal housingAllowance = BigDecimal.ZERO;

    @Column(name = "transport_allowance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Column(name = "medical_allowance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal medicalAllowance = BigDecimal.ZERO;

    @Column(name = "performance_bonus", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal performanceBonus = BigDecimal.ZERO;

    @Column(name = "overtime_pay", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal overtimePay = BigDecimal.ZERO;

    @Column(name = "gross_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "tax_deduction", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal taxDeduction = BigDecimal.ZERO;

    @Column(name = "insurance_deduction", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal insuranceDeduction = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "currency", length = 5)
    @Builder.Default
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payslip_url")
    private String payslipUrl;

    @Column(name = "notes", length = 500)
    private String notes;

    public enum PayrollStatus {
        DRAFT, PROCESSING, APPROVED, PAID, CANCELLED
    }
}
