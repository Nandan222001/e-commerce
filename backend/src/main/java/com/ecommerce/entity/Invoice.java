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

    @Column(nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal shippingCharge = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    private String pdfUrl;
    private String notes;

    public enum InvoiceStatus {
        DRAFT,
        SENT,
        PAID,
        PARTIALLY_PAID,
        OVERDUE,
        CANCELLED
    }

    /* =========================
       Derived value protection
       ========================= */
    @PrePersist
    @PreUpdate
    private void calculateBalance() {
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (paidAmount == null) paidAmount = BigDecimal.ZERO;
        this.balanceAmount = totalAmount.subtract(paidAmount);
    }
}
