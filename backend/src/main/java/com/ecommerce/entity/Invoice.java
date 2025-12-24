package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Invoice extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private BigDecimal subtotal;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalTax;
    private BigDecimal shippingCharge;
    private BigDecimal discount;
    private BigDecimal totalAmount;

    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    private String pdfUrl;
    private String notes;

    public enum InvoiceStatus {
        DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
    }
}