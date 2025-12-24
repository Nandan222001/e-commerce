package com.ecommerce.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductSearchRequest {
    private String searchTerm;
    private Long categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean inStock;
    private String brand;
    private String sortBy;
    private String sortDirection;
}