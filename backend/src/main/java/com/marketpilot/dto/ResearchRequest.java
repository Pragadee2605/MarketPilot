package com.marketpilot.dto;

public class ResearchRequest {
    private String businessIdea;
    private String location;
    private String targetCustomer;
    private String budget;
    private String additionalRequirements;

    public ResearchRequest() {}

    public ResearchRequest(String businessIdea, String location, String targetCustomer, String budget, String additionalRequirements) {
        this.businessIdea = businessIdea;
        this.location = location;
        this.targetCustomer = targetCustomer;
        this.budget = budget;
        this.additionalRequirements = additionalRequirements;
    }

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
}
