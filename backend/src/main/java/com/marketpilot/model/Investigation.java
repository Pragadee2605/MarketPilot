package com.marketpilot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String businessIdea;
    @Column(columnDefinition = "TEXT")
    private String location;
    @Column(columnDefinition = "TEXT")
    private String targetCustomer;
    @Column(columnDefinition = "TEXT")
    private String budget;
    @Column(columnDefinition = "TEXT")
    private String additionalRequirements;
    @Column(columnDefinition = "TEXT")
    private String status;
    @Column(columnDefinition = "TEXT")
    private String researchId;
    @Column(columnDefinition = "TEXT")
    private String aiSummary;
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getBusinessIdea() { return businessIdea; }
    public void setBusinessIdea(String businessIdea) { this.businessIdea = businessIdea; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getTargetCustomer() { return targetCustomer; }
    public void setTargetCustomer(String targetCustomer) { this.targetCustomer = targetCustomer; }
    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }
    public String getAdditionalRequirements() { return additionalRequirements; }
    public void setAdditionalRequirements(String additionalRequirements) { this.additionalRequirements = additionalRequirements; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResearchId() { return researchId; }
    public void setResearchId(String researchId) { this.researchId = researchId; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public Instant getCreatedAt() { return createdAt; }
}
