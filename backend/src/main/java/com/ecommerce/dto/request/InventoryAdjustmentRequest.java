package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAdjustmentRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity change is required")
    private Integer quantity; // Can be negative for reduction

    @NotNull(message = "Reason is required")
    private String reason;

    private String notes;
}