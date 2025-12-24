package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class FinanceStatsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalProfit;
    private BigDecimal totalExpenses;
    private BigDecimal totalTax;
    private Long pendingInvoices;
    private BigDecimal pendingAmount;
    private Double growthRate; // Year over year
    private Map<String, BigDecimal> paymentMethods;
}