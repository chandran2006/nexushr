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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    private static final BigDecimal TAX_RATE              = new BigDecimal("0.15");
    private static final BigDecimal INSURANCE_RATE        = new BigDecimal("0.05");
    private static final BigDecimal HOUSING_ALLOWANCE_PCT = new BigDecimal("0.20");
    private static final BigDecimal TRANSPORT_ALLOWANCE_PCT = new BigDecimal("0.10");
    private static final BigDecimal MEDICAL_ALLOWANCE_PCT = new BigDecimal("0.05");

    @Transactional
    public Payroll processPayroll(UUID employeeId, LocalDate periodStart, LocalDate periodEnd) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        payrollRepository.findByEmployeeIdAndPayPeriodStartAndPayPeriodEnd(employeeId, periodStart, periodEnd)
                .ifPresent(p -> { throw new DuplicateResourceException("Payroll already processed for this period"); });

        BigDecimal basicSalary = employee.getBaseSalary() != null
                ? employee.getBaseSalary() : BigDecimal.ZERO;

        BigDecimal housingAllowance    = pct(basicSalary, HOUSING_ALLOWANCE_PCT);
        BigDecimal transportAllowance  = pct(basicSalary, TRANSPORT_ALLOWANCE_PCT);
        BigDecimal medicalAllowance    = pct(basicSalary, MEDICAL_ALLOWANCE_PCT);
        BigDecimal grossSalary         = basicSalary.add(housingAllowance).add(transportAllowance).add(medicalAllowance);
        BigDecimal taxDeduction        = pct(grossSalary, TAX_RATE);
        BigDecimal insuranceDeduction  = pct(basicSalary, INSURANCE_RATE);
        BigDecimal netSalary           = grossSalary.subtract(taxDeduction).subtract(insuranceDeduction);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriodStart(periodStart)
                .payPeriodEnd(periodEnd)
                .basicSalary(basicSalary)
                .housingAllowance(housingAllowance)
                .transportAllowance(transportAllowance)
                .medicalAllowance(medicalAllowance)
                .grossSalary(grossSalary)
                .taxDeduction(taxDeduction)
                .insuranceDeduction(insuranceDeduction)
                .netSalary(netSalary)
                .currency(employee.getCurrency())
                .status(Payroll.PayrollStatus.DRAFT)
                .build();

        payroll = payrollRepository.save(payroll);
        log.info("Payroll processed for employee: {} period: {}-{}", employee.getEmployeeId(), periodStart, periodEnd);
        return payroll;
    }

    @Transactional
    public Payroll approvePayroll(UUID payrollId) {
        Payroll payroll = getPayrollById(payrollId);
        if (payroll.getStatus() != Payroll.PayrollStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT payrolls can be approved");
        }
        payroll.setStatus(Payroll.PayrollStatus.APPROVED);
        payroll = payrollRepository.save(payroll);
        auditService.log("PAYROLL_APPROVED", "Payroll", payrollId.toString(),
                Payroll.PayrollStatus.DRAFT.name(), Payroll.PayrollStatus.APPROVED.name(), "Payroll approved");
        return payroll;
    }

    @Transactional
    public Payroll markAsPaid(UUID payrollId) {
        Payroll payroll = getPayrollById(payrollId);
        if (payroll.getStatus() != Payroll.PayrollStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED payrolls can be marked as paid");
        }
        payroll.setStatus(Payroll.PayrollStatus.PAID);
        payroll.setPaymentDate(LocalDate.now());
        payroll = payrollRepository.save(payroll);

        notificationService.notifyUser(
                payroll.getEmployee().getUser().getId(),
                "Payslip Ready",
                "Your payslip for " + payroll.getPayPeriodStart() + " to " + payroll.getPayPeriodEnd() + " is ready",
                payroll.getId()
        );
        auditService.log("PAYROLL_PAID", "Payroll", payrollId.toString(),
                Payroll.PayrollStatus.APPROVED.name(), Payroll.PayrollStatus.PAID.name(), "Payroll marked as paid");
        return payroll;
    }

    /**
     * Bulk payroll: each employee processed in its own transaction so one failure
     * does not roll back the entire batch.
     */
    public void processBulkPayroll(LocalDate periodStart, LocalDate periodEnd) {
        List<Employee> activeEmployees = employeeRepository
                .findAllByStatusAndDeletedFalse(Employee.EmployeeStatus.ACTIVE);

        AtomicInteger processed = new AtomicInteger(0);
        AtomicInteger skipped   = new AtomicInteger(0);
        AtomicInteger failed    = new AtomicInteger(0);

        activeEmployees.forEach(emp -> {
            try {
                processSinglePayrollInNewTx(emp.getId(), periodStart, periodEnd);
                processed.incrementAndGet();
            } catch (DuplicateResourceException e) {
                skipped.incrementAndGet();
                log.debug("Payroll already exists for: {}", emp.getEmployeeId());
            } catch (Exception e) {
                failed.incrementAndGet();
                log.error("Payroll failed for employee {}: {}", emp.getEmployeeId(), e.getMessage());
            }
        });

        log.info("Bulk payroll complete — processed: {}, skipped: {}, failed: {}",
                processed.get(), skipped.get(), failed.get());
        auditService.log("BULK_PAYROLL", "Payroll", periodStart + "_" + periodEnd,
                null, "processed=" + processed.get(), "Bulk payroll run completed");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processSinglePayrollInNewTx(UUID employeeId, LocalDate periodStart, LocalDate periodEnd) {
        processPayroll(employeeId, periodStart, periodEnd);
    }

    @Transactional(readOnly = true)
    public Page<Payroll> getEmployeePayrolls(UUID employeeId, int page, int size) {
        return payrollRepository.findByEmployeeIdOrderByPayPeriodStartDesc(employeeId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Page<Payroll> getMyPayrolls(UUID userId, int page, int size) {
        Employee employee = employeeRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        return payrollRepository.findByEmployeeIdOrderByPayPeriodStartDesc(employee.getId(), PageRequest.of(page, size));
    }

    private Payroll getPayrollById(UUID id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));
    }

    private BigDecimal pct(BigDecimal base, BigDecimal rate) {
        return base.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }
}
