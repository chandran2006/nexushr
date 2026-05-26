package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.Goal;
import com.nexushr.entity.PerformanceReview;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.GoalRepository;
import com.nexushr.repository.PerformanceReviewRepository;
import com.nexushr.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/performance")
@RequiredArgsConstructor
@Tag(name = "Performance", description = "Performance management")
public class PerformanceController {

    private final PerformanceReviewRepository reviewRepository;
    private final GoalRepository goalRepository;
    private final EmployeeRepository employeeRepository;
    private final SecurityUtils securityUtils;

    @Data
    static class ReviewRequest {
        @NotNull private UUID employeeId;
        @NotNull private LocalDate reviewPeriodStart;
        @NotNull private LocalDate reviewPeriodEnd;
        @NotNull private PerformanceReview.ReviewType reviewType;
    }

    @Data
    static class ReviewUpdateRequest {
        private BigDecimal overallRating;
        private String strengths;
        private String areasForImprovement;
        private String comments;
        private PerformanceReview.ReviewStatus status;
    }

    @Data
    static class GoalRequest {
        @NotNull private UUID employeeId;
        @NotBlank private String title;
        private String description;
        private LocalDate targetDate;
        private Goal.GoalPriority priority = Goal.GoalPriority.MEDIUM;
        private String category;
        private String keyResults;
    }

    @Data
    static class GoalProgressRequest {
        @NotNull private BigDecimal progress;
        private Goal.GoalStatus status;
    }

    @GetMapping("/reviews/employee/{employeeId}")
    @Operation(summary = "Get employee reviews")
    public ResponseEntity<ApiResponse<Page<PerformanceReview>>> reviews(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId, PageRequest.of(page, size))));
    }

    @PostMapping("/reviews")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Create performance review")
    public ResponseEntity<ApiResponse<PerformanceReview>> createReview(@Valid @RequestBody ReviewRequest req) {
        var employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));
        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewPeriodStart(req.getReviewPeriodStart())
                .reviewPeriodEnd(req.getReviewPeriodEnd())
                .reviewType(req.getReviewType())
                .status(PerformanceReview.ReviewStatus.IN_PROGRESS)
                .build();
        return ResponseEntity.ok(ApiResponse.success("Review created", reviewRepository.save(review)));
    }

    @PutMapping("/reviews/{id}")
    @Operation(summary = "Update performance review")
    public ResponseEntity<ApiResponse<PerformanceReview>> updateReview(
            @PathVariable UUID id, @Valid @RequestBody ReviewUpdateRequest req) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        if (req.getOverallRating() != null) review.setOverallRating(req.getOverallRating());
        if (req.getStrengths() != null) review.setStrengths(req.getStrengths());
        if (req.getAreasForImprovement() != null) review.setAreasForImprovement(req.getAreasForImprovement());
        if (req.getComments() != null) review.setComments(req.getComments());
        if (req.getStatus() != null) review.setStatus(req.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Review updated", reviewRepository.save(review)));
    }

    @GetMapping("/goals/employee/{employeeId}")
    @Operation(summary = "Get employee goals")
    public ResponseEntity<ApiResponse<Page<Goal>>> goals(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                goalRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId, PageRequest.of(page, size))));
    }

    @PostMapping("/goals")
    @Operation(summary = "Create goal")
    public ResponseEntity<ApiResponse<Goal>> createGoal(@Valid @RequestBody GoalRequest req) {
        var employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));
        Goal goal = Goal.builder()
                .employee(employee)
                .title(req.getTitle())
                .description(req.getDescription())
                .targetDate(req.getTargetDate())
                .priority(req.getPriority())
                .category(req.getCategory())
                .keyResults(req.getKeyResults())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Goal created", goalRepository.save(goal)));
    }

    @PutMapping("/goals/{id}/progress")
    @Operation(summary = "Update goal progress")
    public ResponseEntity<ApiResponse<Goal>> updateProgress(
            @PathVariable UUID id, @Valid @RequestBody GoalProgressRequest req) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        goal.setProgressPercentage(req.getProgress());
        if (req.getStatus() != null) goal.setStatus(req.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Goal updated", goalRepository.save(goal)));
    }
}
