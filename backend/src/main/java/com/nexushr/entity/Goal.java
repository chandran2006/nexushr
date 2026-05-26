package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "goals", indexes = {
    @Index(name = "idx_goal_employee", columnList = "employee_id"),
    @Index(name = "idx_goal_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GoalStatus status = GoalStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GoalPriority priority;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "key_results", columnDefinition = "TEXT")
    private String keyResults;

    public enum GoalStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD
    }

    public enum GoalPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
