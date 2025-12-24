package com.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RedeemPointsRequest {
    @NotNull(message = "Points to redeem is required")
    @Min(value = 1, message = "Points must be positive")
    private Integer points;

    private String rewardType; // DISCOUNT, GIFT_CARD, PRODUCT
}