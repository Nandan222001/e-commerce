package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Coupon extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;

    private LocalDateTime expiryDate;
    private boolean active;

    private Integer maxUsages;
    private Integer maxUsagesPerUser;

    public enum DiscountType {
        PERCENTAGE, FIXED_AMOUNT
    }
}