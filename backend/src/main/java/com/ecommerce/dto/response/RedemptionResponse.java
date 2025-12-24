package com.ecommerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RedemptionResponse {
    private Long id;
    private Integer pointsRedeemed;
    private String rewardType;
    private String rewardCode; // Coupon code or Gift card code
    private String status;
    private LocalDateTime redeemedAt;
}