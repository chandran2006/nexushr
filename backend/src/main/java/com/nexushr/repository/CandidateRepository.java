package com.nexushr.repository;

import com.nexushr.entity.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    Page<Candidate> findByJobPostingIdOrderByCreatedAtDesc(UUID jobPostingId, Pageable pageable);

    Page<Candidate> findByStatusOrderByCreatedAtDesc(Candidate.CandidateStatus status, Pageable pageable);

    long countByJobPostingId(UUID jobPostingId);

    long countByStatus(Candidate.CandidateStatus status);
}
