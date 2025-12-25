package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder; // Use SuperBuilder as per previous fixes
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Cart extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id") // This owns the relationship
    private User user;
    
    // Fix: Make this read-only so Hibernate doesn't try to map it twice
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId; 

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default // If using Builder pattern
    private List<CartItem> items = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shipping;
    private BigDecimal discount;
    private BigDecimal total;
    
    private String couponCode;
}