package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndStatus(Long userId, Order.OrderStatus status, Pageable pageable);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
            "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.user.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Order> searchOrders(String search, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o JOIN o.orderItems oi WHERE o.user.id = :userId AND oi.product.id = :productId AND o.status = 'DELIVERED'")
    boolean hasUserPurchasedProduct(Long userId, Long productId);

    Long countByUserId(Long userId);

    Long countByUserIdAndStatus(Long userId, Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :userId AND o.status <> 'CANCELLED'")
    BigDecimal getTotalSpentByUser(Long userId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.status <> 'CANCELLED'")
    BigDecimal getRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    Long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Long countByStatus(Order.OrderStatus status);

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(Pageable pageable);

    // Analytics queries (simplified for JPA)
    @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as amount FROM orders WHERE created_at BETWEEN :startDate AND :endDate GROUP BY DATE(created_at)", nativeQuery = true)
    List<Map<String, Object>> getDailySales(LocalDate startDate, LocalDate endDate);

    @Query(value = "SELECT YEARWEEK(created_at) as week, SUM(total_amount) as amount FROM orders WHERE created_at BETWEEN :startDate AND :endDate GROUP BY YEARWEEK(created_at)", nativeQuery = true)
    List<Map<String, Object>> getWeeklySales(LocalDate startDate, LocalDate endDate);

    @Query(value = "SELECT CONCAT(YEAR(created_at), '-', MONTH(created_at)) as month, SUM(total_amount) as amount FROM orders WHERE created_at BETWEEN :startDate AND :endDate GROUP BY YEAR(created_at), MONTH(created_at)", nativeQuery = true)
    List<Map<String, Object>> getMonthlySales(LocalDate startDate, LocalDate endDate);

    @Query(value = "SELECT YEAR(created_at) as year, SUM(total_amount) as amount FROM orders WHERE YEAR(created_at) BETWEEN :startYear AND :endYear GROUP BY YEAR(created_at)", nativeQuery = true)
    List<Map<String, Object>> getYearlySales(int startYear, int endYear);

    List<Order> findByUserId(Long userId);
}