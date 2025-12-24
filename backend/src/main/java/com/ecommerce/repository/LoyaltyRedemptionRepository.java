package com.ecommerce.repository;

import com.ecommerce.entity.LoyaltyRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoyaltyRedemptionRepository extends JpaRepository<LoyaltyRedemption, Long> {
}