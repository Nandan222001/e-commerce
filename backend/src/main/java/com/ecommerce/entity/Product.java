package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private BigDecimal businessPrice;

    private Integer stockQuantity;
    private Integer minStockLevel;

    private Boolean active = true;
    private Boolean gstApplicable = true;
    private BigDecimal gstRate;

    private String unit;
    private String brand;
    private String manufacturer;
    private String partNumber;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private Set<String> imageUrls = new HashSet<>();

    // Statistics
    private Long viewCount = 0L;
    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    private LocalDateTime deletedAt; // For soft delete

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}