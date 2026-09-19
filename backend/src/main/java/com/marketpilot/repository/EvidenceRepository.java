package com.marketpilot.repository;

import com.marketpilot.model.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByInvestigationId(Long investigationId);
}
