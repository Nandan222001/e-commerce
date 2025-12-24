// src/main/java/com/ecommerce/controller/CartController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.AddToCartRequest;
import com.ecommerce.dto.request.UpdateCartItemRequest;
import com.ecommerce.dto.request.ApplyCouponRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.dto.response.CartValidationResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart", description = "Shopping cart management APIs")
@PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get cart", description = "Get current user's shopping cart")
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching cart for user: {}", user.getEmail());

        CartResponse cart = cartService.getCart(user.getId());

        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    @Operation(summary = "Add to cart", description = "Add product to cart")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Adding product {} to cart for user: {}",
                request.getProductId(), user.getEmail());

        CartResponse cart = cartService.addToCart(user.getId(), request);

        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item", description = "Update quantity of cart item")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Updating cart item {} for user: {}", itemId, user.getEmail());

        CartResponse cart = cartService.updateCartItem(user.getId(), itemId, request);

        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove from cart", description = "Remove item from cart")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long itemId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Removing item {} from cart for user: {}", itemId, user.getEmail());

        CartResponse cart = cartService.removeFromCart(user.getId(), itemId);

        return ResponseEntity.ok(cart);
    }

    @PostMapping("/clear")
    @Operation(summary = "Clear cart", description = "Remove all items from cart")
    public ResponseEntity<Map<String, String>> clearCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Clearing cart for user: {}", user.getEmail());

        cartService.clearCart(user.getId());

        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }

    @PostMapping("/apply-coupon")
    @Operation(summary = "Apply coupon", description = "Apply coupon code to cart")
    public ResponseEntity<CartResponse> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Applying coupon {} to cart for user: {}",
                request.getCouponCode(), user.getEmail());

        CartResponse cart = cartService.applyCoupon(user.getId(), request.getCouponCode());

        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove-coupon")
    @Operation(summary = "Remove coupon", description = "Remove applied coupon from cart")
    public ResponseEntity<CartResponse> removeCoupon(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Removing coupon from cart for user: {}", user.getEmail());

        CartResponse cart = cartService.removeCoupon(user.getId());

        return ResponseEntity.ok(cart);
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate cart", description = "Validate cart items availability and pricing")
    public ResponseEntity<CartValidationResponse> validateCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Validating cart for user: {}", user.getEmail());

        CartValidationResponse validation = cartService.validateCart(user.getId());

        if (!validation.isValid()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(validation);
        }

        return ResponseEntity.ok(validation);
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge carts", description = "Merge guest cart with user cart after login")
    public ResponseEntity<CartResponse> mergeCarts(
            @RequestBody Map<String, Object> guestCart,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Merging guest cart with user cart for: {}", user.getEmail());

        CartResponse cart = cartService.mergeCarts(user.getId(), guestCart);

        return ResponseEntity.ok(cart);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get cart summary", description = "Get cart summary with calculations")
    public ResponseEntity<Map<String, Object>> getCartSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching cart summary for user: {}", user.getEmail());

        Map<String, Object> summary = cartService.getCartSummary(user.getId());

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/save-for-later/{itemId}")
    @Operation(summary = "Save for later", description = "Move item from cart to save for later")
    public ResponseEntity<CartResponse> saveForLater(
            @PathVariable Long itemId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Saving item {} for later for user: {}", itemId, user.getEmail());

        CartResponse cart = cartService.saveForLater(user.getId(), itemId);

        return ResponseEntity.ok(cart);
    }

    @PostMapping("/move-to-cart/{itemId}")
    @Operation(summary = "Move to cart", description = "Move item from save for later to cart")
    public ResponseEntity<CartResponse> moveToCart(
            @PathVariable Long itemId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Moving item {} to cart for user: {}", itemId, user.getEmail());

        CartResponse cart = cartService.moveToCart(user.getId(), itemId);

        return ResponseEntity.ok(cart);
    }

    @GetMapping("/saved-items")
    @Operation(summary = "Get saved items", description = "Get items saved for later")
    public ResponseEntity<List<CartItemResponse>> getSavedItems(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching saved items for user: {}", user.getEmail());

        List<CartItemResponse> savedItems = cartService.getSavedItems(user.getId());

        return ResponseEntity.ok(savedItems);
    }

    @GetMapping("/recommended")
    @Operation(summary = "Get recommendations", description = "Get product recommendations based on cart")
    public ResponseEntity<List<ProductResponse>> getRecommendations(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching recommendations for user: {}", user.getEmail());

        List<ProductResponse> recommendations = cartService.getRecommendations(user.getId());

        return ResponseEntity.ok(recommendations);
    }
}