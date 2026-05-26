package com.nexushr.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private EmployeeStats employeeStats;
    private AttendanceStats attendanceStats;
    private PayrollStats payrollStats;
    private LeaveStats leaveStats;
    private RecruitmentStats recruitmentStats;
    private List<Map<String, Object>> headcountTrend;
    private List<Map<String, Object>> departmentDistribution;
    private List<Map<String, Object>> attritionTrend;
    private List<EmployeeResponse> recentHires;
    private List<Map<String, Object>> upcomingBirthdays;

    @Data
    @Builder
    public static class EmployeeStats {
        private long totalEmployees;
        private long activeEmployees;
        private long newHiresThisMonth;
        private long terminationsThisMonth;
        private double attritionRate;
        private double avgTenureYears;
    }

    @Data
    @Builder
    public static class AttendanceStats {
        private long presentToday;
        private long absentToday;
        private long lateToday;
        private long onLeaveToday;
        private double attendanceRate;
    }

    @Data
    @Builder
    public static class PayrollStats {
        private java.math.BigDecimal totalPayrollThisMonth;
        private java.math.BigDecimal totalPayrollLastMonth;
        private double payrollGrowth;
        private long pendingPayrolls;
    }

    @Data
    @Builder
    public static class LeaveStats {
        private long pendingRequests;
        private long approvedThisMonth;
        private long rejectedThisMonth;
    }

    @Data
    @Builder
    public static class RecruitmentStats {
        private long openPositions;
        private long totalCandidates;
        private long interviewsScheduled;
        private long hiredThisMonth;
    }
}
