package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.Candidate;
import com.nexushr.entity.JobPosting;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.CandidateRepository;
import com.nexushr.repository.DepartmentRepository;
import com.nexushr.repository.JobPostingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recruitment")
@RequiredArgsConstructor
@Tag(name = "Recruitment", description = "Recruitment management")
public class RecruitmentController {

    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final DepartmentRepository departmentRepository;

    @Data
    static class JobRequest {
        @NotBlank private String title;
        private String description;
        private String requirements;
        private String location;
        private int openings = 1;
        private UUID departmentId;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private LocalDate closingDate;
    }

    @Data
    static class CandidateRequest {
        @NotNull private UUID jobPostingId;
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotBlank @Email private String email;
        private String phoneNumber;
        private String coverLetter;
        private String linkedinUrl;
        private String currentCompany;
        private String currentTitle;
        private Integer yearsOfExperience;
    }

    @GetMapping("/jobs")
    @Operation(summary = "List job postings")
    public ResponseEntity<ApiResponse<Page<JobPosting>>> listJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                jobPostingRepository.findByDeletedFalseOrderByCreatedAtDesc(PageRequest.of(page, size))));
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Create job posting")
    public ResponseEntity<ApiResponse<JobPosting>> createJob(@Valid @RequestBody JobRequest req) {
        JobPosting job = JobPosting.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .requirements(req.getRequirements())
                .location(req.getLocation())
                .openings(req.getOpenings())
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .closingDate(req.getClosingDate())
                .status(JobPosting.JobStatus.DRAFT)
                .build();
        if (req.getDepartmentId() != null) {
            departmentRepository.findById(req.getDepartmentId()).ifPresent(job::setDepartment);
        }
        return ResponseEntity.ok(ApiResponse.success("Job posting created", jobPostingRepository.save(job)));
    }

    @PutMapping("/jobs/{id}/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Publish job posting")
    public ResponseEntity<ApiResponse<JobPosting>> publish(@PathVariable UUID id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", id));
        job.setStatus(JobPosting.JobStatus.PUBLISHED);
        return ResponseEntity.ok(ApiResponse.success("Job published", jobPostingRepository.save(job)));
    }

    @GetMapping("/candidates")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "List candidates")
    public ResponseEntity<ApiResponse<Page<Candidate>>> listCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID jobId) {
        Page<Candidate> candidates = jobId != null
                ? candidateRepository.findByJobPostingIdOrderByCreatedAtDesc(jobId, PageRequest.of(page, size))
                : candidateRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(candidates));
    }

    @PostMapping("/candidates")
    @Operation(summary = "Submit application")
    public ResponseEntity<ApiResponse<Candidate>> apply(@Valid @RequestBody CandidateRequest req) {
        JobPosting job = jobPostingRepository.findById(req.getJobPostingId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", req.getJobPostingId()));
        Candidate candidate = Candidate.builder()
                .jobPosting(job)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phoneNumber(req.getPhoneNumber())
                .coverLetter(req.getCoverLetter())
                .linkedinUrl(req.getLinkedinUrl())
                .currentCompany(req.getCurrentCompany())
                .currentTitle(req.getCurrentTitle())
                .yearsOfExperience(req.getYearsOfExperience())
                .status(Candidate.CandidateStatus.APPLIED)
                .build();
        return ResponseEntity.ok(ApiResponse.success("Application submitted", candidateRepository.save(candidate)));
    }

    @PutMapping("/candidates/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Update candidate status")
    public ResponseEntity<ApiResponse<Candidate>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));
        candidate.setStatus(Candidate.CandidateStatus.valueOf(body.get("status")));
        if (body.containsKey("notes")) candidate.setNotes(body.get("notes"));
        if (body.containsKey("interviewDate")) candidate.setInterviewDate(LocalDate.parse(body.get("interviewDate")));
        return ResponseEntity.ok(ApiResponse.success("Status updated", candidateRepository.save(candidate)));
    }
}
