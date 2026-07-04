package com.nexushr.repository;

import com.nexushr.entity.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    Page<Candidate> findByJobPostingIdOrderByCreatedAtDesc(UUID jobPostingId, Pageable pageable);

    Page<Candidate> findByStatusOrderByCreatedAtDesc(Candidate.CandidateStatus status, Pageable pageable);

    @Query("SELECT c FROM Candidate c JOIN FETCH c.jobPosting WHERE c.deleted = false ORDER BY c.createdAt DESC")
    Page<Candidate> findAllActive(Pageable pageable);

    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.status = :status AND c.deleted = false")
    long countActiveByStatus(@Param("status") Candidate.CandidateStatus status);

    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.status = 'HIRED' " +
           "AND c.updatedAt >= :monthStart AND c.deleted = false")
    long countHiredThisMonth(@Param("monthStart") java.time.LocalDateTime monthStart);

    long countByStatus(Candidate.CandidateStatus status);

    @Query("SELECT c FROM Candidate c WHERE c.deleted = false AND " +
           "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Candidate> searchCandidates(@Param("search") String search, Pageable pageable);
}
