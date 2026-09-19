package com.marketpilot.controller;

import com.marketpilot.model.Evidence;
import com.marketpilot.repository.EvidenceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
public class EvidenceController {

    private final EvidenceRepository repo;

    public EvidenceController(EvidenceRepository repo) { this.repo = repo; }

    @GetMapping("/api/evidence")
    public List<Evidence> listAll() { return repo.findAll(); }

    @GetMapping("/api/investigations/{id}/evidence")
    public List<Evidence> listForInvestigation(@PathVariable Long id) { return repo.findByInvestigationId(id); }

    @PostMapping("/api/investigations/{id}/evidence")
    public ResponseEntity<Evidence> create(@PathVariable Long id, @RequestBody Evidence e) {
        e.setInvestigationId(id);
        Evidence saved = repo.save(e);
        return ResponseEntity.created(URI.create("/api/evidence/" + saved.getId())).body(saved);
    }
}
