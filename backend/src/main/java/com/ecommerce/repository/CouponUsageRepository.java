package com.ecommerce.repository;

import com.ecommerce.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    int countByCouponId(Long couponId);
    int countByCouponIdAndUserId(Long couponId, Long userId);
}