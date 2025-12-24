// src/main/java/com/ecommerce/controller/ProductController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.ProductSearchRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Products", description = "Product management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Get paginated list of products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean inStock,
            Authentication authentication) {

        log.info("Fetching products - page: {}, size: {}, sortBy: {}", page, size, sortBy);

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        User.CustomerType customerType = null;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        Page<ProductResponse> products = productService.getAllProducts(
                pageable, category, inStock, customerType);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Get product details by ID")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("Fetching product with ID: {}", id);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        ProductResponse product = productService.getProductById(id, customerType);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by various criteria")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @Valid ProductSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        log.info("Searching products with criteria: {}", searchRequest);

        Pageable pageable = PageRequest.of(page, size);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        Page<ProductResponse> results = productService.searchProducts(
                searchRequest, customerType, pageable);

        return ResponseEntity.ok(results);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Get list of featured products")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit,
            Authentication authentication) {

        log.info("Fetching featured products, limit: {}", limit);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        List<ProductResponse> products = productService.getFeaturedProducts(limit, customerType);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/new-arrivals")
    @Operation(summary = "Get new arrivals", description = "Get recently added products")
    public ResponseEntity<List<ProductResponse>> getNewArrivals(
            @RequestParam(defaultValue = "8") int limit,
            Authentication authentication) {

        log.info("Fetching new arrivals, limit: {}", limit);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        List<ProductResponse> products = productService.getNewArrivals(limit, customerType);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/best-sellers")
    @Operation(summary = "Get best sellers", description = "Get best selling products")
    public ResponseEntity<List<ProductResponse>> getBestSellers(
            @RequestParam(defaultValue = "8") int limit,
            Authentication authentication) {

        log.info("Fetching best sellers, limit: {}", limit);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        List<ProductResponse> products = productService.getBestSellers(limit, customerType);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category", description = "Get all products in a category")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        log.info("Fetching products for category: {}", categoryId);

        Pageable pageable = PageRequest.of(page, size);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        Page<ProductResponse> products = productService.getProductsByCategory(
                categoryId, customerType, pageable);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/related/{productId}")
    @Operation(summary = "Get related products", description = "Get products related to a specific product")
    public ResponseEntity<List<ProductResponse>> getRelatedProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit,
            Authentication authentication) {

        log.info("Fetching related products for product: {}", productId);

        User.CustomerType customerType = User.CustomerType.INDIVIDUAL;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            customerType = user.getCustomerType();
        }

        List<ProductResponse> products = productService.getRelatedProducts(
                productId, limit, customerType);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/filters")
    @Operation(summary = "Get available filters", description = "Get available filter options")
    public ResponseEntity<Map<String, Object>> getProductFilters() {
        log.info("Fetching product filters");

        Map<String, Object> filters = productService.getAvailableFilters();
        return ResponseEntity.ok(filters);
    }

    @GetMapping("/price-range")
    @Operation(summary = "Get price range", description = "Get minimum and maximum product prices")
    public ResponseEntity<Map<String, Double>> getPriceRange(
            @RequestParam(required = false) String category) {

        log.info("Fetching price range for category: {}", category);

        Map<String, Double> priceRange = productService.getPriceRange(category);
        return ResponseEntity.ok(priceRange);
    }

    @PostMapping("/{productId}/view")
    @Operation(summary = "Record product view", description = "Record that a product was viewed")
    public ResponseEntity<Void> recordProductView(
            @PathVariable Long productId,
            Authentication authentication) {

        Long userId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            userId = user.getId();
        }

        productService.recordProductView(productId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-availability/{productId}")
    @Operation(summary = "Check product availability", description = "Check if product is in stock")
    public ResponseEntity<Map<String, Object>> checkProductAvailability(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int quantity) {

        log.info("Checking availability for product: {}, quantity: {}", productId, quantity);

        boolean available = productService.checkAvailability(productId, quantity);
        int availableStock = productService.getAvailableStock(productId);

        Map<String, Object> response = Map.of(
                "available", available,
                "requestedQuantity", quantity,
                "availableStock", availableStock,
                "message", available
                        ? "Product is available"
                        : "Insufficient stock. Only " + availableStock + " items available");

        return ResponseEntity.ok(response);
    }
}