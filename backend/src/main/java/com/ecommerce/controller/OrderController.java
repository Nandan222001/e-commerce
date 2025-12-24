// src/main/java/com/ecommerce/controller/OrderController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.OrderSummaryResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.User;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Create order", description = "Create a new order")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Creating order for user: {}", user.getEmail());

        OrderResponse order = orderService.createOrder(request, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Get user orders", description = "Get orders for authenticated user")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String status,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching orders for user: {}", user.getEmail());

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<OrderResponse> orders = orderService.getUserOrders(user.getId(), status, pageable);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Get order details", description = "Get detailed information about an order")
    public ResponseEntity<OrderResponse> getOrderDetails(
            @PathVariable Long orderId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching order details for order: {}", orderId);

        OrderResponse order = orderService.getOrderDetails(orderId, user);

        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Cancel order", description = "Cancel an order")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> reason,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Cancelling order: {} for user: {}", orderId, user.getEmail());

        String cancellationReason = reason != null ? reason.get("reason") : "Customer request";

        OrderResponse order = orderService.cancelOrder(orderId, user, cancellationReason);

        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}/track")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Track order", description = "Get order tracking information")
    public ResponseEntity<Map<String, Object>> trackOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Tracking order: {} for user: {}", orderId, user.getEmail());

        Map<String, Object> trackingInfo = orderService.getOrderTracking(orderId, user);

        return ResponseEntity.ok(trackingInfo);
    }

    @GetMapping("/{orderId}/invoice")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Download invoice", description = "Download order invoice as PDF")
    public ResponseEntity<ByteArrayResource> downloadInvoice(
            @PathVariable Long orderId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Downloading invoice for order: {}", orderId);

        byte[] invoicePdf = orderService.generateInvoicePdf(orderId, user);

        ByteArrayResource resource = new ByteArrayResource(invoicePdf);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice_" + orderId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(invoicePdf.length)
                .body(resource);
    }

    @PostMapping("/{orderId}/return")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Request return", description = "Request return for delivered order")
    public ResponseEntity<Map<String, Object>> requestReturn(
            @PathVariable Long orderId,
            @Valid @RequestBody Map<String, Object> returnRequest,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Return request for order: {} by user: {}", orderId, user.getEmail());

        Map<String, Object> response = orderService.processReturnRequest(
                orderId, user, returnRequest);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Get order summary", description = "Get user's order summary statistics")
    public ResponseEntity<OrderSummaryResponse> getOrderSummary(Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching order summary for user: {}", user.getEmail());

        OrderSummaryResponse summary = orderService.getUserOrderSummary(user.getId());

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/{orderId}/review")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Review order", description = "Add review for delivered order")
    public ResponseEntity<Map<String, String>> reviewOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody Map<String, Object> review,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Adding review for order: {} by user: {}", orderId, user.getEmail());

        orderService.addOrderReview(orderId, user, review);

        return ResponseEntity.ok(Map.of("message", "Review added successfully"));
    }

    @PostMapping("/calculate-shipping")
    @Operation(summary = "Calculate shipping", description = "Calculate shipping cost for order")
    public ResponseEntity<Map<String, Object>> calculateShipping(
            @Valid @RequestBody Map<String, Object> shippingDetails) {

        log.info("Calculating shipping cost");

        Map<String, Object> shippingInfo = orderService.calculateShipping(shippingDetails);

        return ResponseEntity.ok(shippingInfo);
    }

    @PostMapping("/validate-coupon")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Validate coupon", description = "Validate coupon code for discount")
    public ResponseEntity<Map<String, Object>> validateCoupon(
            @RequestBody Map<String, String> couponData,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String couponCode = couponData.get("code");

        log.info("Validating coupon: {} for user: {}", couponCode, user.getEmail());

        Map<String, Object> validationResult = orderService.validateCoupon(couponCode, user);

        return ResponseEntity.ok(validationResult);
    }
}