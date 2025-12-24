package com.ecommerce.dto.response;
import lombok.experimental.SuperBuilder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@SuperBuilder
@Data
@EqualsAndHashCode(callSuper = true)
public class UserDetailResponse extends UserResponse {

    private Long totalOrders;

    private BigDecimal totalSpent;

    private Integer loyaltyPoints;

    private LocalDateTime memberSince;

    private LocalDateTime lastLogin;
}
