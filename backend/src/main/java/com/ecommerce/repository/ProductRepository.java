package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,JpaSpecificationExecutor<Product> {
    boolean existsBySku(String sku);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true")
    List<Product> findFeaturedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.createdAt >= :date ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(LocalDateTime date, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.totalReviews DESC")
    List<Product> findBestSellers(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND p.id <> :productId")
    List<Product> findRelatedProducts(Long categoryId, Long productId, Pageable pageable);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL")
    List<String> findDistinctBrands();

    @Query(value = "SELECT DISTINCT attribute_name FROM product_attributes", nativeQuery = true)
    List<String> findDistinctAttributes();

    @Query("SELECT MIN(p.basePrice) FROM Product p WHERE p.active = true")
    BigDecimal findMinPrice();

    @Query("SELECT MAX(p.basePrice) FROM Product p WHERE p.active = true")
    BigDecimal findMaxPrice();

    @Query("SELECT MIN(p.basePrice) FROM Product p JOIN p.category c WHERE p.active = true AND c.name = :category")
    BigDecimal findMinPriceByCategory(String category);

    @Query("SELECT MAX(p.basePrice) FROM Product p JOIN p.category c WHERE p.active = true AND c.name = :category")
    BigDecimal findMaxPriceByCategory(String category);

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(Long id);

    Long countByActiveTrue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.stockQuantity <= p.minStockLevel")
    Long countLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.stockQuantity = 0")
    Long countOutOfStockProducts();

    Page<Product> findByIdIn(List<Long> ids, Pageable pageable);
}