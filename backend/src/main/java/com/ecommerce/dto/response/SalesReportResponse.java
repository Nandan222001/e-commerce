package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class SalesReportResponse {
    private BigDecimal totalSales;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private List<Map<String, Object>> salesByPeriod;
    private List<Map<String, Object>> topProducts;
    private List<Map<String, Object>> salesByCategory;
}