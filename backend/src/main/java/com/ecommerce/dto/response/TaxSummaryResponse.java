package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class TaxSummaryResponse {
    private BigDecimal totalTaxCollected;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private BigDecimal igst;
    private Map<String, BigDecimal> taxByState;
    private BigDecimal inputTaxCredit;
    private BigDecimal netPayable;
}