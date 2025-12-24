package com.ecommerce.service;

import com.ecommerce.entity.Product;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
public class ElasticsearchService {
    public boolean isAvailable() { return false; }
    public List<Long> searchProducts(String searchTerm) { return Collections.emptyList(); }
    public void indexProduct(Product product) {}
    public void updateProduct(Product product) {}
    public void deleteProduct(Long id) {}
}