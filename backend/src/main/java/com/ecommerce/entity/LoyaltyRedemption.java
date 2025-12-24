package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "loyalty_redemptions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRedemption extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer points;
    private String rewardType;
    private BigDecimal rewardValue;
    private String status;
}