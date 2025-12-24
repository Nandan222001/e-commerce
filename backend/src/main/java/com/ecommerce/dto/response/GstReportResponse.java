package com.ecommerce.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class GstReportResponse {

    private String period;

    private BigDecimal totalTaxableValue;

    private BigDecimal totalGst;

    private List<Map<String, Object>> invoiceDetails;
}
