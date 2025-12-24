package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserStatisticsResponse {
    private Long totalOrders;
    private BigDecimal totalSpent;
    private Long totalReviews;
    private Long wishlistItems;
    private Integer loyaltyPoints;
    private LocalDateTime memberSince;
}