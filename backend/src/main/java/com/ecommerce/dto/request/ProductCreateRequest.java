package com.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductCreateRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal basePrice;

    private BigDecimal businessPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock must be non-negative")
    private Integer stockQuantity;

    private Integer minStockLevel = 0;

    private Boolean gstApplicable = true;
    private BigDecimal gstRate;

    private String unit;
    private String brand;
    private String manufacturer;
    private String partNumber;

    private Map<String, String> attributes;
}