package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomerRevenueResponse {
    private Long customerId;
    private String customerName;
    private String email;
    private BigDecimal totalRevenue;
    private Long orderCount;
    private BigDecimal averageOrderValue;
    private String lastOrderDate;
}