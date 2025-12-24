package com.ecommerce.repository;

import com.ecommerce.entity.RecentlyViewed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewed, Long> {
    List<RecentlyViewed> findByUserIdOrderByViewedAtDesc(Long userId);
    Optional<RecentlyViewed> findByUserIdAndProductId(Long userId, Long productId);
    
    @Modifying
    @Query(value = "DELETE FROM recently_viewed WHERE user_id = :userId AND id NOT IN (SELECT id FROM (SELECT id FROM recently_viewed WHERE user_id = :userId ORDER BY viewed_at DESC LIMIT :limit) t)", nativeQuery = true)
    void keepOnlyRecent(Long userId, int limit);
}