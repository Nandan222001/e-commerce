package com.ecommerce.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ReconciliationResponse {
    private Integer totalTransactions;
    private Integer matchedCount;
    private Integer mismatchedCount;
    private Integer missingInSystemCount;
    private Integer missingInGatewayCount;
    private List<String> discrepancies;
    private Integer reconciledCount; // If auto-fix was enabled
}