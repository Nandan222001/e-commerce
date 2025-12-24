package com.ecommerce.dto.response;

import lombok.Data;

@Data
public class LoyaltyPointsResponse {
    private Integer totalPoints;
    private Integer availablePoints;
    private Integer redeemedPoints;
    private String tier; // BRONZE, SILVER, GOLD, PLATINUM
    private Integer pointsToNextTier;
}