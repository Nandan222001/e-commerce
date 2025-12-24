package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class CashFlowResponse {
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal totalInflow;
    private BigDecimal totalOutflow;
    private BigDecimal netCashFlow;
    private List<Map<String, Object>> transactions;
}