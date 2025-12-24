package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SavedItem extends BaseEntity {

    private Long userId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}