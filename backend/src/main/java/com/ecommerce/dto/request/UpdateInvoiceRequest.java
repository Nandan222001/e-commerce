package com.ecommerce.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateInvoiceRequest {
    private String status;
    private LocalDate dueDate;
    private String notes;
}