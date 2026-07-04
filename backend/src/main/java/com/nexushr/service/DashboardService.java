package com.nexushr.service;

import com.nexushr.dto.response.DashboardResponse;
import com.nexushr.entity.Employee;
import com.nexushr.entity.JobPosting;
import com.nexushr.entity.LeaveRequest;
import com.nexushr.entity.Candidate;
import com.nexushr.entity.Payroll;
import com.nexushr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final EmployeeService employeeService;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'main'")
    public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthEnd = monthStart.minusDays(1);

        // Employee stats
        long totalEmployees = employeeRepository.countByDeletedFalse();
        long activeEmployees = employeeRepository.countByStatusAndDeletedFalse(Employee.EmployeeStatus.ACTIVE);
        long newHiresThisMonth = employeeRepository.countByHireDateBetweenAndDeletedFalse(monthStart, today);
        long terminationsThisMonth = employeeRepository.countByTerminationDateBetweenAndDeletedFalse(monthStart, today);
        double attritionRate = totalEmployees > 0
                ? BigDecimal.valueOf((double) terminationsThisMonth / totalEmployees * 100)
                        .setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        // Attendance stats
        long presentToday = attendanceRepository.countPresentByDate(today);
        long absentToday = attendanceRepository.countAbsentByDate(today);
        long lateToday = attendanceRepository.countLateByDate(today);
        long onLeaveToday = attendanceRepository.countOnLeaveByDate(today);
        double attendanceRate = totalEmployees > 0
                ? BigDecimal.valueOf((double) presentToday / totalEmployees * 100)
                        .setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        // Payroll stats
        BigDecimal payrollThisMonth = Optional.ofNullable(
                payrollRepository.getTotalPayrollForPeriod(monthStart, today)).orElse(BigDecimal.ZERO);
        BigDecimal payrollLastMonth = Optional.ofNullable(
                payrollRepository.getTotalPayrollForPeriod(lastMonthStart, lastMonthEnd)).orElse(BigDecimal.ZERO);
        long pendingPayrolls = payrollRepository.countByStatus(Payroll.PayrollStatus.DRAFT);

        double payrollGrowth = 0.0;
        if (payrollLastMonth.compareTo(BigDecimal.ZERO) > 0) {
            payrollGrowth = payrollThisMonth.subtract(payrollLastMonth)
                    .divide(payrollLastMonth, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Leave stats
        long pendingLeaves = leaveRequestRepository.countByStatusAndDeletedFalse(LeaveRequest.LeaveStatus.PENDING);
        long approvedThisMonth = leaveRequestRepository.countByStatusAndApprovedAtBetween(
                LeaveRequest.LeaveStatus.APPROVED, monthStart.atStartOfDay(), today.atTime(23, 59, 59));
        long rejectedThisMonth = leaveRequestRepository.countByStatusAndApprovedAtBetween(
                LeaveRequest.LeaveStatus.REJECTED, monthStart.atStartOfDay(), today.atTime(23, 59, 59));

        // Recruitment stats
        long openPositions = jobPostingRepository.countByStatusAndDeletedFalse(JobPosting.JobStatus.PUBLISHED);
        long totalCandidates = candidateRepository.countActiveByStatus(Candidate.CandidateStatus.APPLIED);
        long interviewsScheduled = candidateRepository.countActiveByStatus(Candidate.CandidateStatus.INTERVIEW_SCHEDULED);
        long hiredThisMonth = candidateRepository.countHiredThisMonth(monthStart.atStartOfDay());

        // Charts
        List<Map<String, Object>> deptDistribution = employeeRepository.getDepartmentDistribution();
        List<Map<String, Object>> headcountTrend = buildHeadcountTrend(today);

        // Recent hires — sorted by hire date desc
        var recentHires = employeeRepository
                .findRecentHires(PageRequest.of(0, 5))
                .getContent()
                .stream()
                .map(employeeService::mapToResponse)
                .toList();

        return DashboardResponse.builder()
                .employeeStats(DashboardResponse.EmployeeStats.builder()
                        .totalEmployees(totalEmployees)
                        .activeEmployees(activeEmployees)
                        .newHiresThisMonth(newHiresThisMonth)
                        .terminationsThisMonth(terminationsThisMonth)
                        .attritionRate(attritionRate)
                        .avgTenureYears(3.2) // TODO: compute from hireDate
                        .build())
                .attendanceStats(DashboardResponse.AttendanceStats.builder()
                        .presentToday(presentToday)
                        .absentToday(absentToday)
                        .lateToday(lateToday)
                        .onLeaveToday(onLeaveToday)
                        .attendanceRate(attendanceRate)
                        .build())
                .payrollStats(DashboardResponse.PayrollStats.builder()
                        .totalPayrollThisMonth(payrollThisMonth)
                        .totalPayrollLastMonth(payrollLastMonth)
                        .payrollGrowth(payrollGrowth)
                        .pendingPayrolls(pendingPayrolls)
                        .build())
                .leaveStats(DashboardResponse.LeaveStats.builder()
                        .pendingRequests(pendingLeaves)
                        .approvedThisMonth(approvedThisMonth)
                        .rejectedThisMonth(rejectedThisMonth)
                        .build())
                .recruitmentStats(DashboardResponse.RecruitmentStats.builder()
                        .openPositions(openPositions)
                        .totalCandidates(totalCandidates)
                        .interviewsScheduled(interviewsScheduled)
                        .hiredThisMonth(hiredThisMonth)
                        .build())
                .departmentDistribution(deptDistribution)
                .headcountTrend(headcountTrend)
                .recentHires(recentHires)
                .build();
    }

    // Evict dashboard cache every 5 minutes so data stays fresh
    @Scheduled(fixedDelay = 300_000)
    @CacheEvict(value = "dashboard", allEntries = true)
    public void evictDashboardCache() {
        log.debug("Dashboard cache evicted");
    }

    private List<Map<String, Object>> buildHeadcountTrend(LocalDate today) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = today.minusMonths(i);
            LocalDate end = month.withDayOfMonth(month.lengthOfMonth());
            long count = employeeRepository.countByHireDateBeforeAndDeletedFalse(end.plusDays(1));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("month", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            item.put("count", count);
            result.add(item);
        }
        return result;
    }
}
