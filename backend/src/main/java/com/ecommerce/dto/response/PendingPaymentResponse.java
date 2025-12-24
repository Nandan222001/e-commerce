package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PendingPaymentResponse {
    private Long id;
    private String referenceNumber;
    private String type; // INVOICE, REFUND
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status;
    private String customerName;
}