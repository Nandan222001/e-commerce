package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InventoryResponse {
    private Long productId;
    private String sku;
    private String productName;
    private String category;
    private Integer currentStock;
    private Integer minStock;
    private Integer maxStock;
    private BigDecimal stockValue;
    private String status; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
    private String lastUpdated;
}