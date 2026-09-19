package com.marketpilot.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketpilot.model.Investigation;
import com.marketpilot.repository.EvidenceRepository;
import com.marketpilot.repository.InvestigationRepository;
import com.marketpilot.dto.ResearchRequest;
import com.marketpilot.service.ResearchBridgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/investigations")
public class InvestigationController {

    private final InvestigationRepository repo;
    private final EvidenceRepository evidenceRepo;
    private final ResearchBridgeService bridge;

    public InvestigationController(InvestigationRepository repo, EvidenceRepository evidenceRepo, ResearchBridgeService bridge) {
        this.repo = repo;
        this.evidenceRepo = evidenceRepo;
        this.bridge = bridge;
    }

    @PostMapping
    public ResponseEntity<Investigation> create(@RequestBody Investigation inv) {
        inv.setStatus("CREATED");
        Investigation saved = repo.save(inv);
        return ResponseEntity.created(URI.create("/api/investigations/" + saved.getId())).body(saved);
    }

    @GetMapping
    public List<Investigation> list() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Investigation> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repo.findById(id).map(inv -> {
            var evList = evidenceRepo.findByInvestigationId(id);
            evidenceRepo.deleteAll(evList);
            repo.delete(inv);
            return ResponseEntity.ok(Map.of("message", "Investigation and associated evidence deleted successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reset")
    public ResponseEntity<?> resetAll() {
        evidenceRepo.deleteAll();
        repo.deleteAll();
        return ResponseEntity.ok(Map.of("message", "Database successfully cleaned and reset for cloud deployment."));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> start(@PathVariable Long id) {
        return repo.findById(id).map(inv -> {
            inv.setStatus("PLANNING");
            repo.save(inv);

            ResearchRequest rq = new ResearchRequest(inv.getBusinessIdea(), inv.getLocation(), inv.getTargetCustomer(), inv.getBudget(), inv.getAdditionalRequirements());
            try {
                var resp = bridge.startResearch(rq, inv.getId());
                if (resp != null && resp.containsKey("id")) {
                    try {
                        inv.setResearchId(String.valueOf(resp.get("id")));
                    } catch (Exception ignored) {}
                }

                Object processing = resp != null ? resp.get("processing") : null;
                if (processing instanceof Map<?, ?> procMap) {
                    Object summary = procMap.get("summary");
                    if (summary != null) {
                        try {
                            inv.setAiSummary(new ObjectMapper().writeValueAsString(summary));
                        } catch (Exception ignored) {}
                    }
                }

                inv.setStatus("RESEARCHING");
                repo.save(inv);
                return ResponseEntity.ok(resp);
            } catch (Exception ex) {
                inv.setStatus("ERROR");
                repo.save(inv);
                return ResponseEntity.status(502).body(Map.of("error", "AI engine unavailable"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> summary(@PathVariable Long id) {
        return repo.findById(id).map(inv -> {
            String aiSummary = inv.getAiSummary();
            if (aiSummary == null || aiSummary.isBlank()) {
                return ResponseEntity.ok(Map.of("status", "NO_SUMMARY"));
            }
            try {
                return ResponseEntity.ok(new ObjectMapper().readValue(aiSummary, Map.class));
            } catch (Exception e) {
                return ResponseEntity.ok(Map.of("raw", aiSummary));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<String> status(@PathVariable Long id) {
        return repo.findById(id).map(inv -> ResponseEntity.ok(inv.getStatus())).orElse(ResponseEntity.notFound().build());
    }
}
