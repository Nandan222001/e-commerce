// src/main/java/com/ecommerce/service/CartService.java
package com.ecommerce.service;

import com.ecommerce.dto.request.AddToCartRequest;
import com.ecommerce.dto.request.UpdateCartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.dto.response.CartValidationResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.CartMapper;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.service.RecommendationService;
import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.dto.response.ProductResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final ProductMapper productMapper;
    private final UserRepository userRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final SavedItemRepository savedItemRepository;
    private final CartMapper cartMapper;
    private final ProductService productService;
    private final RecommendationService recommendationService;

    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        // Update cart prices and availability
        updateCartPrices(cart);

        return cartMapper.toResponse(cart);
    }

    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check stock availability
        if (!productService.checkAvailability(product.getId(), request.getQuantity())) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }

        // Check if product already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();

            // Check stock for combined quantity
            if (!productService.checkAvailability(product.getId(), newQuantity)) {
                throw new RuntimeException("Cannot add more. Stock limit reached");
            }

            item.setQuantity(newQuantity);
            item.setUpdatedAt(LocalDateTime.now());
        } else {
            // Add new item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setCreatedAt(LocalDateTime.now());

            cart.getItems().add(cartItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        // Update cart totals
        updateCartTotals(cart);

        log.info("Product {} added to cart for user {}", request.getProductId(), userId);

        return cartMapper.toResponse(cart);
    }

    public CartResponse updateCartItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        // Verify item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        // Check stock availability
        if (!productService.checkAvailability(cartItem.getProduct().getId(), request.getQuantity())) {
            throw new RuntimeException("Insufficient stock");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItem.setUpdatedAt(LocalDateTime.now());

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        // Update cart totals
        updateCartTotals(cart);

        log.info("Cart item {} updated for user {}", itemId, userId);

        return cartMapper.toResponse(cart);
    }

    public CartResponse removeFromCart(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        // Verify item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        // Update cart totals
        updateCartTotals(cart);

        log.info("Item {} removed from cart for user {}", itemId, userId);

        return cartMapper.toResponse(cart);
    }

    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setCouponCode(null);
        cart.setDiscount(BigDecimal.ZERO);
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);

        log.info("Cart cleared for user {}", userId);
    }

    public CartResponse applyCoupon(Long userId, String couponCode) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        // Validate coupon
        validateCoupon(coupon, cart);

        // Calculate discount
        BigDecimal discount = calculateCouponDiscount(coupon, cart.getSubtotal());

        cart.setCouponCode(couponCode);
        cart.setDiscount(discount);
        cart.setUpdatedAt(LocalDateTime.now());

        cart = cartRepository.save(cart);

        // Update cart totals
        updateCartTotals(cart);

        log.info("Coupon {} applied to cart for user {}", couponCode, userId);

        return cartMapper.toResponse(cart);
    }

    public CartResponse removeCoupon(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.setCouponCode(null);
        cart.setDiscount(BigDecimal.ZERO);
        cart.setUpdatedAt(LocalDateTime.now());

        cart = cartRepository.save(cart);

        // Update cart totals
        updateCartTotals(cart);

        log.info("Coupon removed from cart for user {}", userId);

        return cartMapper.toResponse(cart);
    }

    public CartValidationResponse validateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartValidationResponse validation = new CartValidationResponse();
        validation.setValid(true);
        List<String> messages = new ArrayList<>();

        // Check each item
        Iterator<CartItem> iterator = cart.getItems().iterator();
        while (iterator.hasNext()) {
            CartItem item = iterator.next();
            Product product = item.getProduct();

            // Check if product is active
            if (!product.getActive()) {
                messages.add(product.getName() + " is no longer available");
                iterator.remove();
                validation.setValid(false);
                continue;
            }

            // Check stock
            if (!productService.checkAvailability(product.getId(), item.getQuantity())) {
                int availableStock = productService.getAvailableStock(product.getId());
                if (availableStock > 0) {
                    item.setQuantity(availableStock);
                    messages.add(product.getName() + " quantity adjusted to " + availableStock);
                } else {
                    messages.add(product.getName() + " is out of stock");
                    iterator.remove();
                }
                validation.setValid(false);
            }

            // Check for price changes
            BigDecimal currentPrice = getProductPrice(product, cart.getUser());
            if (!currentPrice.equals(item.getPriceAtTimeOfAdding())) {
                item.setPriceAtTimeOfAdding(currentPrice);
                messages.add(product.getName() + " price has changed");
            }
        }

        // Validate coupon if applied
        if (cart.getCouponCode() != null) {
            try {
                Coupon coupon = couponRepository.findByCode(cart.getCouponCode()).orElse(null);
                if (coupon != null) {
                    validateCoupon(coupon, cart);
                }
            } catch (Exception e) {
                cart.setCouponCode(null);
                cart.setDiscount(BigDecimal.ZERO);
                messages.add("Applied coupon is no longer valid");
                validation.setValid(false);
            }
        }

        // Save changes
        cart = cartRepository.save(cart);

        // Update totals
        updateCartTotals(cart);

        validation.setMessages(messages);
        validation.setCart(cartMapper.toResponse(cart));

        return validation;
    }

    public CartResponse mergeCarts(Long userId, Map<String, Object> guestCart) {
        Cart userCart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        // Parse guest cart items
        List<Map<String, Object>> guestItems = (List<Map<String, Object>>) guestCart.get("items");

        for (Map<String, Object> guestItem : guestItems) {
            Long productId = Long.valueOf(guestItem.get("productId").toString());
            Integer quantity = Integer.valueOf(guestItem.get("quantity").toString());

            // Try to add to cart
            try {
                AddToCartRequest request = new AddToCartRequest();
                request.setProductId(productId);
                request.setQuantity(quantity);

                addToCart(userId, request);
            } catch (Exception e) {
                log.warn("Could not merge item {} to cart: {}", productId, e.getMessage());
            }
        }

        return getCart(userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCartSummary(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        Map<String, Object> summary = new HashMap<>();
        summary.put("itemCount", cart.getItems().size());
        summary.put("totalQuantity", cart.getItems().stream()
                .mapToInt(CartItem::getQuantity).sum());
        summary.put("subtotal", cart.getSubtotal());
        summary.put("tax", cart.getTax());
        summary.put("shipping", cart.getShipping());
        summary.put("discount", cart.getDiscount());
        summary.put("total", cart.getTotal());
        summary.put("hasOutOfStockItems", cart.getItems().stream()
                .anyMatch(item -> !productService.checkAvailability(
                        item.getProduct().getId(), item.getQuantity())));

        return summary;
    }

    public CartResponse saveForLater(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        // Create saved item
        SavedItem savedItem = new SavedItem();
        savedItem.setUserId(userId);
        savedItem.setProduct(cartItem.getProduct());
        savedItem.setCreatedAt(LocalDateTime.now());

        savedItemRepository.save(savedItem);

        // Remove from cart
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        // Update totals
        updateCartTotals(cart);

        log.info("Item {} saved for later by user {}", itemId, userId);

        return cartMapper.toResponse(cart);
    }

    public CartResponse moveToCart(Long userId, Long savedItemId) {
        SavedItem savedItem = savedItemRepository.findById(savedItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved item not found"));

        // Add to cart
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(savedItem.getProduct().getId());
        request.setQuantity(1);

        CartResponse cartResponse = addToCart(userId, request);

        // Remove from saved items
        savedItemRepository.delete(savedItem);

        log.info("Saved item {} moved to cart by user {}", savedItemId, userId);

        return cartResponse;
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> getSavedItems(Long userId) {
        List<SavedItem> savedItems = savedItemRepository.findByUserId(userId);

        return savedItems.stream()
                .map(item -> {
                    CartItemResponse response = new CartItemResponse();
                    response.setId(item.getId());
                    response.setProduct(productMapper.toResponse(item.getProduct()));
                    response.setCreatedAt(item.getCreatedAt());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRecommendations(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        if (cart == null || cart.getItems().isEmpty()) {
            // Return popular products if cart is empty
            return productService.getBestSellers(6, null);
        }

        // Get product IDs from cart
        List<Long> cartProductIds = cart.getItems().stream()
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toList());

        // Get recommendations based on cart items
        return recommendationService.getCartRecommendations(cartProductIds, 6);
    }

    // Helper methods
    private Cart createNewCart(Long userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setUser(userRepository.findById(userId).orElse(null));
        cart.setItems(new ArrayList<>());
        cart.setSubtotal(BigDecimal.ZERO);
        cart.setTax(BigDecimal.ZERO);
        cart.setShipping(BigDecimal.ZERO);
        cart.setDiscount(BigDecimal.ZERO);
        cart.setTotal(BigDecimal.ZERO);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());

        return cartRepository.save(cart);
    }

    private void updateCartPrices(Cart cart) {
        for (CartItem item : cart.getItems()) {
            BigDecimal currentPrice = getProductPrice(item.getProduct(), cart.getUser());
            item.setCurrentPrice(currentPrice);
        }
    }

    private void updateCartTotals(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal price = getProductPrice(product, cart.getUser());
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            subtotal = subtotal.add(itemTotal);

            // Calculate tax if applicable
            if (product.getGstApplicable()) {
                BigDecimal itemTax = itemTotal.multiply(product.getGstRate())
                        .divide(BigDecimal.valueOf(100));
                tax = tax.add(itemTax);
            }
        }

        cart.setSubtotal(subtotal);
        cart.setTax(tax);

        // Calculate shipping (free for orders above 500)
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("500")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("50");
        cart.setShipping(shipping);

        // Apply discount if coupon is applied
        if (cart.getDiscount() == null) {
            cart.setDiscount(BigDecimal.ZERO);
        }

        // Calculate total
        BigDecimal total = subtotal.add(tax).add(shipping).subtract(cart.getDiscount());
        cart.setTotal(total);

        cartRepository.save(cart);
    }

    private BigDecimal getProductPrice(Product product, User user) {
        if (user != null && user.getCustomerType() == User.CustomerType.BUSINESS
                && product.getBusinessPrice() != null) {
            return product.getBusinessPrice();
        }
        return product.getBasePrice();
    }

    private void validateCoupon(Coupon coupon, Cart cart) {
        // Check if coupon is active
        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is not active");
        }

        // Check expiry
        if (coupon.getExpiryDate() != null &&
                coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon has expired");
        }

        // Check minimum order amount
        if (coupon.getMinOrderAmount() != null &&
                cart.getSubtotal().compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Minimum order amount not met for this coupon");
        }

        // Check usage limits
        if (coupon.getMaxUsages() != null) {
            int usageCount = couponUsageRepository.countByCouponId(coupon.getId());
            if (usageCount >= coupon.getMaxUsages()) {
                throw new RuntimeException("Coupon usage limit exceeded");
            }
        }

        // Check per-user usage limit
        if (coupon.getMaxUsagesPerUser() != null) {
            int userUsageCount = couponUsageRepository.countByCouponIdAndUserId(
                    coupon.getId(), cart.getUserId());
            if (userUsageCount >= coupon.getMaxUsagesPerUser()) {
                throw new RuntimeException("You have already used this coupon");
            }
        }
    }

    private BigDecimal calculateCouponDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            BigDecimal discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100));

            // Apply maximum discount if set
            if (coupon.getMaxDiscountAmount() != null &&
                    discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                return coupon.getMaxDiscountAmount();
            }

            return discount;
        } else {
            // Fixed amount discount
            return coupon.getDiscountValue();
        }
    }
}