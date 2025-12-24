package com.ecommerce.service;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResult {
    private boolean success;
    private String transactionId;
    private String message;
}