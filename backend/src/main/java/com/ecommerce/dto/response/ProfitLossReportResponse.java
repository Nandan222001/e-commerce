package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProfitLossReportResponse {
    private BigDecimal revenue;
    private BigDecimal cogs; // Cost of Goods Sold
    private BigDecimal grossProfit;
    private BigDecimal operatingExpenses;
    private BigDecimal netProfit;
    private BigDecimal grossMargin; // Percentage
    private BigDecimal netMargin; // Percentage
}