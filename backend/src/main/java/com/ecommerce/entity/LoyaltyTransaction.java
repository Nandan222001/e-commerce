package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_transactions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransaction extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer points;
    private String type; // EARNED, REDEEMED, EXPIRED
    private String description;
    private String referenceId;
}