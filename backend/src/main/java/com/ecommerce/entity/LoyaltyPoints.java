package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_points")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyPoints extends BaseEntity {

    @Column(unique = true)
    private Long userId;

    private Integer totalPoints = 0;
    private Integer availablePoints = 0;
    private Integer redeemedPoints = 0;

    private String tier; // BRONZE, SILVER, GOLD
}