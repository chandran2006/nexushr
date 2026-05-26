package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews", indexes = {
    @Index(name = "idx_review_employee", columnList = "employee_id"),
    @Index(name = "idx_review_period", columnList = "review_period_start, review_period_end")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private Employee reviewer;

    @Column(name = "review_period_start", nullable = false)
    private LocalDate reviewPeriodStart;

    @Column(name = "review_period_end", nullable = false)
    private LocalDate reviewPeriodEnd;

    @Column(name = "overall_rating", precision = 3, scale = 1)
    private BigDecimal overallRating;

    @Column(name = "performance_score", precision = 5, scale = 2)
    private BigDecimal performanceScore;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;

    @Column(name = "goals_achieved", columnDefinition = "TEXT")
    private String goalsAchieved;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", length = 30)
    private ReviewType reviewType;

    public enum ReviewStatus {
        DRAFT, IN_PROGRESS, COMPLETED, ACKNOWLEDGED
    }

    public enum ReviewType {
        ANNUAL, QUARTERLY, PROBATION, PROMOTION, PEER
    }
}
