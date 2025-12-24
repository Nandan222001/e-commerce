package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private UserResponse user;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingCharge;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private String couponCode;
    private AddressResponse shippingAddress;
    private AddressResponse billingAddress;
    private List<OrderItemResponse> orderItems;
    private LocalDateTime createdAt;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private String trackingNumber;
    private String customerNotes;
    private String cancellationReason;
    private InvoiceResponse invoice;
    private String paymentTransactionId;
}