package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CartItemResponse {
    private Long id;
    private ProductResponse product;
    private Integer quantity;
    private BigDecimal currentPrice;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
}