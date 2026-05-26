package com.nexushr.service;

import com.nexushr.entity.LeaveRequest;
import com.nexushr.entity.Employee;
import com.nexushr.entity.User;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public LeaveRequest applyLeave(UUID employeeId, LeaveRequest.LeaveType leaveType,
                                   LocalDate startDate, LocalDate endDate, String reason) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        int totalDays = calculateWorkingDays(startDate, endDate);
        validateLeaveBalance(employee, leaveType, totalDays);

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(startDate)
                .endDate(endDate)
                .totalDays(totalDays)
                .reason(reason)
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        notificationService.notifyHRManagers("New Leave Request",
                employee.getUser().getFullName() + " has requested " + totalDays + " days of " + leaveType + " leave",
                leaveRequest.getId());

        return leaveRequest;
    }

    @Transactional
    public LeaveRequest processLeave(UUID leaveId, LeaveRequest.LeaveStatus status, User approver, String notes) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (leaveRequest.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new IllegalStateException("Leave request is not in pending status");
        }

        leaveRequest.setStatus(status);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovalNotes(notes);
        leaveRequest.setApprovedAt(LocalDateTime.now());

        if (status == LeaveRequest.LeaveStatus.APPROVED) {
            deductLeaveBalance(leaveRequest.getEmployee(), leaveRequest.getLeaveType(), leaveRequest.getTotalDays());
        }

        leaveRequest = leaveRequestRepository.save(leaveRequest);

        String notifTitle = status == LeaveRequest.LeaveStatus.APPROVED ? "Leave Approved" : "Leave Rejected";
        String notifMsg = "Your " + leaveRequest.getLeaveType() + " leave request has been " + status.name().toLowerCase();
        notificationService.notifyUser(leaveRequest.getEmployee().getUser().getId(), notifTitle, notifMsg, leaveRequest.getId());

        auditService.log("LEAVE_" + status.name(), "LeaveRequest", leaveId.toString(), null, null, "Leave request " + status.name().toLowerCase());
        return leaveRequest;
    }

    @Transactional(readOnly = true)
    public List<LeaveRequest> getPendingRequests() {
        return leaveRequestRepository.findPendingRequests();
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequest> getEmployeeLeaves(UUID employeeId, int page, int size) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId, PageRequest.of(page, size));
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int workingDays = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }

    private void validateLeaveBalance(Employee employee, LeaveRequest.LeaveType leaveType, int days) {
        if (leaveType == LeaveRequest.LeaveType.ANNUAL && employee.getAnnualLeaveBalance() < days) {
            throw new IllegalArgumentException("Insufficient annual leave balance. Available: " + employee.getAnnualLeaveBalance());
        }
        if (leaveType == LeaveRequest.LeaveType.SICK && employee.getSickLeaveBalance() < days) {
            throw new IllegalArgumentException("Insufficient sick leave balance. Available: " + employee.getSickLeaveBalance());
        }
    }

    private void deductLeaveBalance(Employee employee, LeaveRequest.LeaveType leaveType, int days) {
        if (leaveType == LeaveRequest.LeaveType.ANNUAL) {
            employee.setAnnualLeaveBalance(employee.getAnnualLeaveBalance() - days);
        } else if (leaveType == LeaveRequest.LeaveType.SICK) {
            employee.setSickLeaveBalance(employee.getSickLeaveBalance() - days);
        }
        employeeRepository.save(employee);
    }
}
