package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InventoryStatsResponse {
    private Long totalProducts;
    private BigDecimal totalValue;
    private Long lowStockCount;
    private Long outOfStockCount;
}