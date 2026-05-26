package com.nexushr.repository;

import com.nexushr.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

    Page<JobPosting> findByStatusAndDeletedFalseOrderByCreatedAtDesc(JobPosting.JobStatus status, Pageable pageable);

    Page<JobPosting> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    long countByStatusAndDeletedFalse(JobPosting.JobStatus status);
}
