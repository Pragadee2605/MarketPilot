package com.marketpilot.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Evidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long investigationId;
    @Column(columnDefinition = "TEXT")
    private String type;
    @Column(columnDefinition = "TEXT")
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String source;
    @Column(columnDefinition = "TEXT")
    private String sourceUrl;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("sourceType")
    private String sourceType;
    @JsonProperty("rating")
    private Double rating;
    @JsonProperty("reviewCount")
    private Integer reviewCount;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("price")
    private String price;
    @JsonProperty("extracted_price")
    private Double extractedPrice;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("address")
    private String address;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("gps")
    private String gps;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("place_id")
    private String placeId;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("thumbnail")
    private String thumbnail;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("snippet")
    private String snippet;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("raw")
    private String raw;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("collected_by")
    private String collectedBy;
    @Column(columnDefinition = "TEXT")
    @JsonProperty("collected_from_search_id")
    private String collectedFromSearchId;
    @JsonProperty("collected_at")
    private Instant collectedAt = Instant.now();

    public Long getId() { return id; }
    public Long getInvestigationId() { return investigationId; }
    public void setInvestigationId(Long investigationId) { this.investigationId = investigationId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSource() { return source; }
    public void setSource(Object source) { this.source = writeJson(source); }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public Double getExtractedPrice() { return extractedPrice; }
    public void setExtractedPrice(Double extractedPrice) { this.extractedPrice = extractedPrice; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getGps() { return gps; }
    public void setGps(Object gps) { this.gps = writeJson(gps); }
    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(Object thumbnail) { this.thumbnail = writeJson(thumbnail); }
    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }
    public String getRaw() { return raw; }
    public void setRaw(Object raw) { this.raw = writeJson(raw); }
    public String getCollectedBy() { return collectedBy; }
    public void setCollectedBy(String collectedBy) { this.collectedBy = collectedBy; }
    public String getCollectedFromSearchId() { return collectedFromSearchId; }
    public void setCollectedFromSearchId(String collectedFromSearchId) { this.collectedFromSearchId = collectedFromSearchId; }
    public Instant getCollectedAt() { return collectedAt; }
    public void setCollectedAt(Instant collectedAt) { this.collectedAt = collectedAt; }

    private String writeJson(Object value) {
        if (value == null) return null;
        if (value instanceof String s) return s;
        try {
            return new ObjectMapper().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }
}
