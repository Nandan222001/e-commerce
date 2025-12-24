package com.ecommerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PointsTransactionResponse {
    private Long id;
    private String type; // EARNED, REDEEMED, EXPIRED
    private Integer points;
    private String description;
    private LocalDateTime date;
    private String referenceId; // Order ID usually
}