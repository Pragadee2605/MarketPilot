package com.marketpilot.service;

import com.marketpilot.dto.ResearchRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ResearchBridgeService {

    private final RestTemplate restTemplate;
    private final String aiEngineUrl;

    public ResearchBridgeService(RestTemplate restTemplate, @Value("${ai.engine.url}") String aiEngineUrl) {
        this.restTemplate = restTemplate;
        this.aiEngineUrl = aiEngineUrl;
    }

    public Map<String, Object> startResearch(ResearchRequest req, Long investigationId) {
        try {
            String url = aiEngineUrl + "/research";
            // build payload including the original investigation id so the AI engine can attach evidence correctly
            var payload = Map.<String, Object>of(
                    "businessIdea", req.getBusinessIdea(),
                    "location", req.getLocation(),
                    "targetCustomer", req.getTargetCustomer(),
                    "budget", req.getBudget(),
                    "additionalRequirements", req.getAdditionalRequirements(),
                    "original_investigation_id", investigationId
            );
            Map response = restTemplate.postForObject(url, payload, Map.class);

            // if research id returned, trigger processing on the AI engine
            if (response != null && response.containsKey("id")) {
                String rid = String.valueOf(response.get("id"));
                try {
                    String procUrl = aiEngineUrl + "/research/" + rid + "/process";
                    // trigger processing (synchronous)
                    Map procResp = restTemplate.postForObject(procUrl, null, Map.class);
                    // attach processing summary into response map for caller convenience
                    if (procResp != null) {
                        response.put("processing", procResp);
                    }
                } catch (Exception ignored) {
                    // don't fail the whole call if processing trigger fails; caller can retry
                }
            }

            return response;
        } catch (RestClientException ex) {
            throw ex;
        }
    }
}
