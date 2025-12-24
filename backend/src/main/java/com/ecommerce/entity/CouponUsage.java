package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long couponId;
    private Long userId;
    private LocalDateTime usedAt;
}