package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private String notes;
    private String pdfUrl;
}