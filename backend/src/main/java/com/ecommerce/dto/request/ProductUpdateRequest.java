package com.ecommerce.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductUpdateRequest {
    private String name;
    private String description;
    private Long categoryId;
    private BigDecimal basePrice;
    private BigDecimal businessPrice;
    private Integer minStockLevel;
    private Boolean active;
    private Boolean gstApplicable;
    private BigDecimal gstRate;
    private String unit;
    private String brand;
    private String manufacturer;
    private Map<String, String> attributes;
}