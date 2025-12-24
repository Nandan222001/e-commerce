package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateOrderRequest {

    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItemRequest> items;

    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    private Long billingAddressId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private Map<String, Object> paymentDetails;

    private String customerNotes;

    private String couponCode;

    @Data
    public static class OrderItemRequest {

        @NotNull(message = "Product ID is required")
        private Long productId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
