package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CartItem extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer quantity;

    // ✅ Persisted snapshot price
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtTimeOfAdding;

    // ✅ FIX: expose persisted price safely
    @Transient
    public BigDecimal getCurrentPrice() {
        return priceAtTimeOfAdding;
    }
}
