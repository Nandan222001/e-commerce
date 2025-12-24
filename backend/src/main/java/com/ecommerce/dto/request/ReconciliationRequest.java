package com.ecommerce.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReconciliationRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String paymentGateway;
    private boolean autoFix;
}