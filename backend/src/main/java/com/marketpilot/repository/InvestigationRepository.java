package com.marketpilot.repository;

import com.marketpilot.model.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvestigationRepository extends JpaRepository<Investigation, Long> {
}
