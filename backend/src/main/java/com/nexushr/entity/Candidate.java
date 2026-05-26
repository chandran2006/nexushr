package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidates", indexes = {
    @Index(name = "idx_candidate_email", columnList = "email"),
    @Index(name = "idx_candidate_status", columnList = "status"),
    @Index(name = "idx_candidate_job", columnList = "job_posting_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "linkedin_url", length = 200)
    private String linkedinUrl;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "current_company", length = 100)
    private String currentCompany;

    @Column(name = "current_title", length = 100)
    private String currentTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private CandidateStatus status = CandidateStatus.APPLIED;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rating")
    private Integer rating;

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public enum CandidateStatus {
        APPLIED, SCREENING, INTERVIEW_SCHEDULED, INTERVIEWED, OFFER_SENT, HIRED, REJECTED, WITHDRAWN
    }
}
