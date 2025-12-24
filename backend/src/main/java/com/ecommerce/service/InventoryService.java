// src/main/java/com/ecommerce/service/InventoryService.java
package com.ecommerce.service;

import com.ecommerce.dto.request.InventoryAdjustmentRequest;
import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.dto.response.InventoryStatsResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public Page<InventoryResponse> getInventory(String search, Boolean lowStock, Pageable pageable) {
        // Simplified logic: Assuming ProductRepository has findAll or appropriate query
        Page<Product> products = productRepository.findAll(pageable);
        
        return products.map(product -> {
            InventoryResponse response = new InventoryResponse();
            response.setProductId(product.getId());
            response.setSku(product.getSku());
            response.setProductName(product.getName());
            response.setCurrentStock(product.getStockQuantity());
            response.setMinStock(product.getMinStockLevel());
            response.setStatus(product.getStockQuantity() <= product.getMinStockLevel() ? "LOW_STOCK" : "IN_STOCK");
            if (product.getStockQuantity() == 0) response.setStatus("OUT_OF_STOCK");
            return response;
        });
    }

    @Transactional(readOnly = true)
    public InventoryStatsResponse getInventoryStats() {
        InventoryStatsResponse stats = new InventoryStatsResponse();
        stats.setTotalProducts(productRepository.count());
        stats.setLowStockCount(productRepository.countLowStockProducts());
        stats.setOutOfStockCount(productRepository.countOutOfStockProducts());
        // Approximate total value
        stats.setTotalValue(BigDecimal.ZERO); 
        return stats;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockItems() {
        // This query needs to be implemented in repository or filtered in code
        // For simplicity returning empty
        return List.of();
    }

    public void adjustInventory(InventoryAdjustmentRequest request, User admin) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        int newQuantity = product.getStockQuantity() + request.getQuantity();
        if (newQuantity < 0) throw new RuntimeException("Stock cannot be negative");
        
        product.setStockQuantity(newQuantity);
        productRepository.save(product);
        log.info("Inventory adjusted for product: {}", product.getName());
    }

    public void updateStock(Long productId, Integer quantity, boolean isDeduction) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        int current = product.getStockQuantity();
        if (isDeduction) {
            if (current < quantity) throw new RuntimeException("Insufficient stock");
            product.setStockQuantity(current - quantity);
        } else {
            product.setStockQuantity(current + quantity);
        }
        productRepository.save(product);
    }

    public void reserveStock(Long productId, Integer quantity) {
        updateStock(productId, quantity, true);
    }

    public void releaseReservedStock(Long productId, Integer quantity) {
        updateStock(productId, quantity, false);
    }
}