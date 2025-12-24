package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price; // Calculated based on customer type
    private BigDecimal basePrice;
    private BigDecimal businessPrice;
    private Integer stockQuantity;
    private Boolean inStock;
    private Boolean lowStock;
    private Boolean active;
    private Boolean gstApplicable;
    private BigDecimal gstRate;
    private List<String> imageUrls;
    private String unit;
    private String brand;
    private String manufacturer;
    private String partNumber;
    private Double averageRating;
    private Integer totalReviews;
    private Boolean isNew;
    private Boolean isBestSeller;
    private BigDecimal originalPrice; // If discounted
    private Integer discount; // Percentage
    private Map<String, String> attributes;
}