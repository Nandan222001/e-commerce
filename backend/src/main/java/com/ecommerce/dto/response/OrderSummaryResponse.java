package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderSummaryResponse {
    private Long totalOrders;
    private Long pendingOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private BigDecimal totalSpent;
}