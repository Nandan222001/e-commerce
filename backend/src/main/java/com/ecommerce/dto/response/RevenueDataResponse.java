package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RevenueDataResponse {
    private String period; // Date string or label
    private BigDecimal revenue;
    private BigDecimal profit;
    private Long orderCount;
}