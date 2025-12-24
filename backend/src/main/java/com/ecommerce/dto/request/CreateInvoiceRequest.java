package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateInvoiceRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;

    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String notes;
    private List<String> additionalCharges;
}