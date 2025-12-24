// src/main/java/com/ecommerce/service/ProductService.java
package com.ecommerce.service;

import com.ecommerce.dto.request.ProductCreateRequest;
import com.ecommerce.dto.request.ProductSearchRequest;
import com.ecommerce.dto.request.ProductUpdateRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final FileStorageService fileStorageService;
    private final ElasticsearchService elasticsearchService;
    private final CacheService cacheService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable, String category,
            Boolean inStock, User.CustomerType customerType) {
        Specification<Product> spec = Specification.where(isActive());

        if (category != null && !category.isEmpty()) {
            spec = spec.and(hasCategory(category));
        }

        if (inStock != null && inStock) {
            spec = spec.and(isInStock());
        }

        Page<Product> products = productRepository.findAll(spec, pageable);

        return products.map(product -> {
            ProductResponse response = productMapper.toResponse(product);
            response.setPrice(getCustomerPrice(product, customerType));
            response.setInStock(product.getStockQuantity() > 0);
            response.setLowStock(product.getStockQuantity() <= product.getMinStockLevel());
            return response;
        });
    }

    @Cacheable(value = "products", key = "#id + '_' + #customerType")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id, User.CustomerType customerType) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        ProductResponse response = productMapper.toResponse(product);
        response.setPrice(getCustomerPrice(product, customerType));
        response.setInStock(product.getStockQuantity() > 0);
        response.setLowStock(product.getStockQuantity() <= product.getMinStockLevel());

        // Increment view count
        productRepository.incrementViewCount(id);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(ProductSearchRequest searchRequest,
            User.CustomerType customerType,
            Pageable pageable) {
        log.info("Searching products with criteria: {}", searchRequest);

        // Use Elasticsearch for full-text search if available
        if (elasticsearchService.isAvailable() && searchRequest.getSearchTerm() != null) {
            List<Long> productIds = elasticsearchService.searchProducts(searchRequest.getSearchTerm());

            if (productIds.isEmpty()) {
                return Page.empty(pageable);
            }

            Page<Product> products = productRepository.findByIdIn(productIds, pageable);
            return products.map(product -> {
                ProductResponse response = productMapper.toResponse(product);
                response.setPrice(getCustomerPrice(product, customerType));
                return response;
            });
        }

        // Fallback to database search
        Specification<Product> spec = buildSearchSpecification(searchRequest);
        Page<Product> products = productRepository.findAll(spec, pageable);

        return products.map(product -> {
            ProductResponse response = productMapper.toResponse(product);
            response.setPrice(getCustomerPrice(product, customerType));
            return response;
        });
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductCreateRequest request, User createdBy) {
        log.info("Creating new product: {}", request.getName());

        // Check if SKU already exists
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = productMapper.toEntity(request);

        // Set category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        product.setCreatedBy(createdBy);
        product.setCreatedAt(LocalDateTime.now());
        product.setActive(true);

        product = productRepository.save(product);

        // Index in Elasticsearch
        elasticsearchService.indexProduct(product);

        log.info("Product created successfully: {}", product.getName());

        return productMapper.toResponse(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request, User updatedBy) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        log.info("Updating product: {}", product.getName());

        // Update fields
        productMapper.updateEntity(request, product);

        // Update category if changed
        if (request.getCategoryId() != null &&
                !request.getCategoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        product.setUpdatedBy(updatedBy);
        product.setUpdatedAt(LocalDateTime.now());

        product = productRepository.save(product);

        // Update in Elasticsearch
        elasticsearchService.updateProduct(product);

        log.info("Product updated successfully: {}", product.getName());

        return productMapper.toResponse(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        log.info("Deleting product: {}", product.getName());

        // Soft delete
        product.setActive(false);
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);

        // Remove from Elasticsearch
        elasticsearchService.deleteProduct(id);

        log.info("Product deleted successfully: {}", product.getName());
    }

    @CacheEvict(value = "products", key = "#id + '*'")
    public ProductResponse toggleProductStatus(Long id, User updatedBy) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(!product.getActive());
        product.setUpdatedBy(updatedBy);
        product.setUpdatedAt(LocalDateTime.now());

        product = productRepository.save(product);

        log.info("Product status toggled: {} - {}", product.getName(), product.getActive());

        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts(int limit, User.CustomerType customerType) {
        List<Product> products = productRepository.findFeaturedProducts(
                PageRequest.of(0, limit, Sort.by("createdAt").descending()));

        return products.stream()
                .map(product -> {
                    ProductResponse response = productMapper.toResponse(product);
                    response.setPrice(getCustomerPrice(product, customerType));
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals(int limit, User.CustomerType customerType) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Product> products = productRepository.findNewArrivals(
                thirtyDaysAgo,
                PageRequest.of(0, limit));

        return products.stream()
                .map(product -> {
                    ProductResponse response = productMapper.toResponse(product);
                    response.setPrice(getCustomerPrice(product, customerType));
                    response.setIsNew(true);
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getBestSellers(int limit, User.CustomerType customerType) {
        List<Product> products = productRepository.findBestSellers(
                PageRequest.of(0, limit));

        return products.stream()
                .map(product -> {
                    ProductResponse response = productMapper.toResponse(product);
                    response.setPrice(getCustomerPrice(product, customerType));
                    response.setIsBestSeller(true);
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId,
            User.CustomerType customerType,
            Pageable pageable) {
        Page<Product> products = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);

        return products.map(product -> {
            ProductResponse response = productMapper.toResponse(product);
            response.setPrice(getCustomerPrice(product, customerType));
            return response;
        });
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId, int limit,
            User.CustomerType customerType) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Product> relatedProducts = productRepository.findRelatedProducts(
                product.getCategory().getId(),
                productId,
                PageRequest.of(0, limit));

        return relatedProducts.stream()
                .map(p -> {
                    ProductResponse response = productMapper.toResponse(p);
                    response.setPrice(getCustomerPrice(p, customerType));
                    return response;
                })
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "products", key = "#productId + '*'")
    public void updateStock(Long productId, Integer quantity, boolean isDeduction) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (isDeduction) {
            if (product.getStockQuantity() < quantity) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for product %s. Available: %d, Requested: %d",
                                product.getName(), product.getStockQuantity(), quantity));
            }
            product.setStockQuantity(product.getStockQuantity() - quantity);
        } else {
            product.setStockQuantity(product.getStockQuantity() + quantity);
        }

        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        // Check if low stock alert needed
        if (product.getStockQuantity() <= product.getMinStockLevel()) {
            sendLowStockAlert(product);
        }

        log.info("Stock updated for product {}: {} {}",
                product.getName(),
                isDeduction ? "-" : "+",
                quantity);
    }

    public List<String> uploadProductImages(Long productId, List<MultipartFile> images) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            String imageUrl = fileStorageService.uploadFile(image, "products/" + productId);
            imageUrls.add(imageUrl);
        }

        // Add to product images
        if (product.getImageUrls() == null) {
            product.setImageUrls(new HashSet<>());
        }
        product.getImageUrls().addAll(imageUrls);

        productRepository.save(product);

        log.info("Uploaded {} images for product: {}", images.size(), product.getName());

        return imageUrls;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAvailableFilters() {
        Map<String, Object> filters = new HashMap<>();

        // Get categories
        filters.put("categories", categoryRepository.findAllActive());

        // Get price range
        filters.put("priceRange", getPriceRange(null));

        // Get brands
        filters.put("brands", productRepository.findDistinctBrands());

        // Get other attributes
        filters.put("attributes", productRepository.findDistinctAttributes());

        return filters;
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getPriceRange(String category) {
        BigDecimal minPrice;
        BigDecimal maxPrice;

        if (category != null && !category.isEmpty()) {
            minPrice = productRepository.findMinPriceByCategory(category);
            maxPrice = productRepository.findMaxPriceByCategory(category);
        } else {
            minPrice = productRepository.findMinPrice();
            maxPrice = productRepository.findMaxPrice();
        }

        Map<String, Double> priceRange = new HashMap<>();
        priceRange.put("min", minPrice != null ? minPrice.doubleValue() : 0.0);
        priceRange.put("max", maxPrice != null ? maxPrice.doubleValue() : 100000.0);

        return priceRange;
    }

    public void recordProductView(Long productId, Long userId) {
        productRepository.incrementViewCount(productId);

        if (userId != null) {
            // Record in user's recently viewed
            userService.addToRecentlyViewed(userId, productId);
        }
    }

    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return product.getStockQuantity() >= quantity;
    }

    @Transactional(readOnly = true)
    public int getAvailableStock(Long productId) {
        return productRepository.findById(productId)
                .map(Product::getStockQuantity)
                .orElse(0);
    }

    // Helper methods
    private BigDecimal getCustomerPrice(Product product, User.CustomerType customerType) {
        if (customerType == User.CustomerType.BUSINESS && product.getBusinessPrice() != null) {
            return product.getBusinessPrice();
        }
        return product.getBasePrice();
    }

    private Specification<Product> isActive() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("active"));
    }

    private Specification<Product> hasCategory(String category) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("category").get("name"), category);
    }

    private Specification<Product> isInStock() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.greaterThan(root.get("stockQuantity"), 0);
    }

    private Specification<Product> buildSearchSpecification(ProductSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Active products only
            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            // Search term
            if (request.getSearchTerm() != null && !request.getSearchTerm().isEmpty()) {
                String searchTerm = "%" + request.getSearchTerm().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("sku")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("partNumber")), searchTerm)));
            }

            // Category filter
            if (request.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), request.getCategoryId()));
            }

            // Price range
            if (request.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("basePrice"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("basePrice"), request.getMaxPrice()));
            }

            // In stock filter
            if (request.getInStock() != null && request.getInStock()) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stockQuantity"), 0));
            }

            // Brand filter
            if (request.getBrand() != null && !request.getBrand().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("brand"), request.getBrand()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void sendLowStockAlert(Product product) {
        // Send notification to admin
        notificationService.sendLowStockAlert(product);

        // Send email alert
        emailService.sendLowStockAlert(product);

        log.warn("Low stock alert for product: {} (Current stock: {})",
                product.getName(), product.getStockQuantity());
    }
}