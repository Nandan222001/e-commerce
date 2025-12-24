package com.ecommerce.service;

import com.ecommerce.dto.response.ProductResponse;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
public class RecommendationService {
    public List<ProductResponse> getCartRecommendations(List<Long> productIds, int limit) {
        return Collections.emptyList();
    }
}