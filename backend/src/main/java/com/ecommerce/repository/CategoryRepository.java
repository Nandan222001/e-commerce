package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIdIsNull();
    
    @Query("SELECT c FROM Category c WHERE c.active = true")
    List<Category> findAllActive();
    
    @Query("SELECT new map(c.name as category, COUNT(p) as count, SUM(oi.totalAmount) as revenue) " +
           "FROM Category c JOIN c.products p JOIN p.orderItems oi JOIN oi.order o " +
           "WHERE o.status = 'DELIVERED' GROUP BY c.id, c.name")
    List<Map<String, Object>> getCategorySalesStats();
}