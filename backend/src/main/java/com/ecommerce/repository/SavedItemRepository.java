package com.ecommerce.repository;

import com.ecommerce.entity.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {
    List<SavedItem> findByUserId(Long userId);
}