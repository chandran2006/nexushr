package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.Payroll;
import com.nexushr.exception.DuplicateResourceException;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.15");
    private static final BigDecimal INSURANCE_RATE = new BigDecimal("0.05");
    private static final BigDecimal HOUSING_ALLOWANCE_RATE = new BigDecimal("0.20");
    private static final BigDecimal TRANSPORT_ALLOWANCE_RATE = new BigDecimal("0.10");

    @Transactional
    public Payroll processPayroll(UUID employeeId, LocalDate periodStart, LocalDate periodEnd) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        payrollRepository.findByEmployeeIdAndPayPeriodStartAndPayPeriodEnd(employeeId, periodStart, periodEnd)
                .ifPresent(p -> { throw new DuplicateResourceException("Payroll already processed for this period"); });

        BigDecimal basicSalary = employee.getBaseSalary() != null ? employee.getBaseSalary() : BigDecimal.ZERO;
        BigDecimal housingAllowance = basicSalary.multiply(HOUSING_ALLOWANCE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal transportAllowance = basicSalary.multiply(TRANSPORT_ALLOWANCE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grossSalary = basicSalary.add(housingAllowance).add(transportAllowance);
        BigDecimal taxDeduction = grossSalary.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal insuranceDeduction = basicSalary.multiply(INSURANCE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netSalary = grossSalary.subtract(taxDeduction).subtract(insuranceDeduction);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriodStart(periodStart)
                .payPeriodEnd(periodEnd)
                .basicSalary(basicSalary)
                .housingAllowance(housingAllowance)
                .transportAllowance(transportAllowance)
                .grossSalary(grossSalary)
                .taxDeduction(taxDeduction)
                .insuranceDeduction(insuranceDeduction)
                .netSalary(netSalary)
                .currency(employee.getCurrency())
                .status(Payroll.PayrollStatus.DRAFT)
                .build();

        payroll = payrollRepository.save(payroll);
        log.info("Payroll processed for employee: {}", employee.getEmployeeId());
        return payroll;
    }

    @Transactional
    public Payroll approvePayroll(UUID payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));
        payroll.setStatus(Payroll.PayrollStatus.APPROVED);
        payroll = payrollRepository.save(payroll);
        auditService.log("PAYROLL_APPROVED", "Payroll", payrollId.toString(), null, null, "Payroll approved");
        return payroll;
    }

    @Transactional
    public Payroll markAsPaid(UUID payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));
        payroll.setStatus(Payroll.PayrollStatus.PAID);
        payroll.setPaymentDate(LocalDate.now());
        payroll = payrollRepository.save(payroll);

        notificationService.notifyUser(
                payroll.getEmployee().getUser().getId(),
                "Payslip Ready",
                "Your payslip for " + payroll.getPayPeriodStart() + " to " + payroll.getPayPeriodEnd() + " is ready",
                payroll.getId()
        );
        return payroll;
    }

    @Transactional
    public void processBulkPayroll(LocalDate periodStart, LocalDate periodEnd) {
        List<Employee> activeEmployees = employeeRepository.findAllByStatusAndDeletedFalse(
                Employee.EmployeeStatus.ACTIVE);

        activeEmployees.forEach(emp -> {
            try {
                processPayroll(emp.getId(), periodStart, periodEnd);
            } catch (DuplicateResourceException e) {
                log.warn("Payroll already exists for employee: {}", emp.getEmployeeId());
            }
        });
    }

    @Transactional(readOnly = true)
    public Page<Payroll> getEmployeePayrolls(UUID employeeId, int page, int size) {
        return payrollRepository.findByEmployeeIdOrderByPayPeriodStartDesc(employeeId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Page<Payroll> getMyPayrolls(UUID userId, int page, int size) {
        var employee = employeeRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new com.nexushr.exception.ResourceNotFoundException("Employee profile not found"));
        return payrollRepository.findByEmployeeIdOrderByPayPeriodStartDesc(employee.getId(), PageRequest.of(page, size));
    }
}
