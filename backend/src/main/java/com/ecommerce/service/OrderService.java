// src/main/java/com/ecommerce/service/OrderService.java
package com.ecommerce.service;
import com.ecommerce.service.InventoryService;
import com.ecommerce.service.InvoiceService;
import com.ecommerce.service.NotificationService;
import com.ecommerce.service.PaymentService;
import com.ecommerce.service.ShippingService;
import com.ecommerce.service.LoyaltyService;
import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.OrderSummaryResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.OrderMapper;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final ReturnRequestRepository returnRequestRepository;
    private final ReviewRepository reviewRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final SmsService smsService;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final OrderMapper orderMapper;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final InvoiceService invoiceService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final PaymentService paymentService;
    private final ShippingService shippingService;
    private final LoyaltyService loyaltyService;

    public OrderResponse createOrder(CreateOrderRequest request, User user) {
        log.info("Creating order for user: {}", user.getEmail());

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setPaymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()));

        // Set addresses
        Address shippingAddress = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found"));
        order.setShippingAddress(shippingAddress);

        if (request.getBillingAddressId() != null) {
            Address billingAddress = addressRepository.findById(request.getBillingAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Billing address not found"));
            order.setBillingAddress(billingAddress);
        } else {
            order.setBillingAddress(shippingAddress);
        }

        // Process order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // Check stock availability
            if (!productService.checkAvailability(product.getId(), itemRequest.getQuantity())) {
                throw new InsufficientStockException(
                        "Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setQuantity(itemRequest.getQuantity());

            // Calculate prices based on customer type
            BigDecimal unitPrice = getProductPrice(product, user.getCustomerType());
            orderItem.setUnitPrice(unitPrice);

            // Calculate item total
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            // Calculate tax if applicable
            BigDecimal taxAmount = BigDecimal.ZERO;
            if (product.getGstApplicable()) {
                taxAmount = itemTotal.multiply(product.getGstRate())
                        .divide(BigDecimal.valueOf(100));
                orderItem.setTaxAmount(taxAmount);
            }

            orderItem.setTotalAmount(itemTotal.add(taxAmount));

            orderItems.add(orderItem);
            subtotal = subtotal.add(itemTotal);
            totalTax = totalTax.add(taxAmount);

            // Reserve stock
            inventoryService.reserveStock(product.getId(), itemRequest.getQuantity());
        }

        order.setOrderItems(orderItems);
        order.setSubtotal(subtotal);

        // Calculate GST breakdown
        if (totalTax.compareTo(BigDecimal.ZERO) > 0) {
            if (isSameState(shippingAddress)) {
                // CGST + SGST
                order.setCgstAmount(totalTax.divide(BigDecimal.valueOf(2)));
                order.setSgstAmount(totalTax.divide(BigDecimal.valueOf(2)));
                order.setIgstAmount(BigDecimal.ZERO);
            } else {
                // IGST
                order.setCgstAmount(BigDecimal.ZERO);
                order.setSgstAmount(BigDecimal.ZERO);
                order.setIgstAmount(totalTax);
            }
        }
        order.setTotalTax(totalTax);

        // Calculate shipping
        BigDecimal shippingCharge = calculateShipping(shippingAddress, subtotal);
        order.setShippingCharge(shippingCharge);

        // Apply coupon if provided
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            discount = applyCoupon(request.getCouponCode(), subtotal, user);
            order.setDiscount(discount);
            order.setCouponCode(request.getCouponCode());
        }

        // Calculate total amount
        BigDecimal totalAmount = subtotal
                .add(totalTax)
                .add(shippingCharge)
                .subtract(discount);
        order.setTotalAmount(totalAmount);

        // Set other fields
        order.setCustomerNotes(request.getCustomerNotes());
        order.setCreatedAt(LocalDateTime.now());

        // Calculate estimated delivery date
        order.setEstimatedDeliveryDate(shippingService.calculateDeliveryDate(shippingAddress));

        // Save order
        order = orderRepository.save(order);

        // Process payment
        if (order.getPaymentMethod() != Order.PaymentMethod.COD) {
            PaymentResult paymentResult = paymentService.processPayment(order, request.getPaymentDetails());
            if (paymentResult.isSuccess()) {
                order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
                order.setStatus(Order.OrderStatus.CONFIRMED);
                order.setPaymentTransactionId(paymentResult.getTransactionId());
            } else {
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setStatus(Order.OrderStatus.CANCELLED);
                // Release reserved stock
                releaseReservedStock(order);
                throw new RuntimeException("Payment failed: " + paymentResult.getMessage());
            }
        } else {
            order.setStatus(Order.OrderStatus.CONFIRMED);
        }

        // Update stock
        for (OrderItem item : orderItems) {
            productService.updateStock(item.getProduct().getId(), item.getQuantity(), true);
        }

        // Generate invoice
        Invoice invoice = invoiceService.generateInvoice(order);
        order.setInvoice(invoice);

        // Add loyalty points
        int loyaltyPoints = calculateLoyaltyPoints(totalAmount);
        loyaltyService.addPoints(user.getId(), loyaltyPoints, "Order #" + order.getOrderNumber());

        // Send notifications
        sendOrderConfirmation(order);

        // Create order status history
        createStatusHistory(order, Order.OrderStatus.PENDING, Order.OrderStatus.CONFIRMED, null);

        log.info("Order created successfully: {}", order.getOrderNumber());

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, String status, Pageable pageable) {
        Page<Order> orders;

        if (status != null && !status.isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            orders = orderRepository.findByUserIdAndStatus(userId, orderStatus, pageable);
        } else {
            orders = orderRepository.findByUserId(userId, pageable);
        }

        return orders.map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(String status, String search, Pageable pageable) {
        Page<Order> orders;

        if (status != null && !status.isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            orders = orderRepository.findByStatus(orderStatus, pageable);
        } else if (search != null && !search.isEmpty()) {
            orders = orderRepository.searchOrders(search, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return orders.map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check if user owns the order or is admin
        if (!order.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        return orderMapper.toResponse(order);
    }

    public OrderResponse cancelOrder(Long orderId, User user, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check if user owns the order or is admin
        if (!order.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        // Check if order can be cancelled
        if (!canBeCancelled(order)) {
            throw new RuntimeException("Order cannot be cancelled in current status");
        }

        Order.OrderStatus previousStatus = order.getStatus();
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancelledBy(user);

        // Release stock
        for (OrderItem item : order.getOrderItems()) {
            productService.updateStock(item.getProduct().getId(), item.getQuantity(), false);
        }

        // Process refund if payment was completed
        if (order.getPaymentStatus() == Order.PaymentStatus.COMPLETED) {
            paymentService.processRefund(order);
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        }

        // Deduct loyalty points if earned
        loyaltyService.deductPoints(order.getUser().getId(),
                calculateLoyaltyPoints(order.getTotalAmount()),
                "Order cancelled: #" + order.getOrderNumber());

        order = orderRepository.save(order);

        // Create status history
        createStatusHistory(order, previousStatus, Order.OrderStatus.CANCELLED, reason);

        // Send cancellation notification
        sendCancellationNotification(order);

        log.info("Order cancelled: {}", order.getOrderNumber());

        return orderMapper.toResponse(order);
    }

    public OrderResponse updateOrderStatus(Long orderId, String status, String notes, User updatedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Order.OrderStatus previousStatus = order.getStatus();
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);

        // Validate status transition
        if (!isValidStatusTransition(previousStatus, newStatus)) {
            throw new RuntimeException("Invalid status transition from " + previousStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        // Update specific fields based on status
        switch (newStatus) {
            case PROCESSING:
                order.setProcessedBy(updatedBy);
                order.setProcessedAt(LocalDateTime.now());
                break;
            case SHIPPED:
                order.setShippedAt(LocalDateTime.now());
                order.setTrackingNumber(shippingService.generateTrackingNumber());
                break;
            case DELIVERED:
                order.setActualDeliveryDate(LocalDateTime.now());
                order.setDeliveredAt(LocalDateTime.now());
                break;
        }

        order = orderRepository.save(order);

        // Create status history
        createStatusHistory(order, previousStatus, newStatus, notes);

        // Send status update notification
        sendStatusUpdateNotification(order);

        log.info("Order status updated: {} - {} to {}",
                order.getOrderNumber(), previousStatus, newStatus);

        return orderMapper.toResponse(order);
    }

    public OrderResponse updatePaymentStatus(Long orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Order.PaymentStatus status = Order.PaymentStatus.valueOf(paymentStatus);
        order.setPaymentStatus(status);

        if (status == Order.PaymentStatus.COMPLETED) {
            order.setPaymentCompletedAt(LocalDateTime.now());

            // Update order status if it was pending payment
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }
        }

        order = orderRepository.save(order);

        log.info("Payment status updated for order: {} - {}", order.getOrderNumber(), status);

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderTracking(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check authorization
        if (!order.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        Map<String, Object> tracking = new HashMap<>();
        tracking.put("orderNumber", order.getOrderNumber());
        tracking.put("status", order.getStatus());
        tracking.put("trackingNumber", order.getTrackingNumber());
        tracking.put("estimatedDelivery", order.getEstimatedDeliveryDate());
        tracking.put("actualDelivery", order.getActualDeliveryDate());

        // Get tracking history
        List<Map<String, Object>> history = new ArrayList<>();
        for (OrderStatusHistory statusHistory : order.getStatusHistory()) {
            Map<String, Object> event = new HashMap<>();
            event.put("status", statusHistory.getStatus());
            event.put("timestamp", statusHistory.getCreatedAt());
            event.put("notes", statusHistory.getNotes());
            history.add(event);
        }
        tracking.put("history", history);

        // Get real-time tracking if available
        if (order.getTrackingNumber() != null) {
            tracking.put("realTimeTracking", shippingService.getTrackingInfo(order.getTrackingNumber()));
        }

        return tracking;
    }

    public byte[] generateInvoicePdf(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check authorization
        if (!order.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        return invoiceService.generateInvoicePdf(order.getInvoice().getId());
    }

    public Map<String, Object> processReturnRequest(Long orderId, User user,
            Map<String, Object> returnRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check if order is eligible for return
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Only delivered orders can be returned");
        }

        LocalDateTime deliveryDate = order.getActualDeliveryDate();
        if (deliveryDate == null || deliveryDate.isBefore(LocalDateTime.now().minusDays(30))) {
            throw new RuntimeException("Return period has expired (30 days)");
        }

        // Create return request
        ReturnRequest returnReq = new ReturnRequest();
        returnReq.setOrder(order);
        returnReq.setReason((String) returnRequest.get("reason"));
        returnReq.setDescription((String) returnRequest.get("description"));
        returnReq.setStatus("PENDING");
        returnReq.setCreatedAt(LocalDateTime.now());

        returnReq = returnRequestRepository.save(returnReq);

        // Send notification to admin
        notificationService.sendReturnRequestNotification(returnReq);

        Map<String, Object> response = new HashMap<>();
        response.put("returnRequestId", returnReq.getId());
        response.put("status", "Return request submitted successfully");
        response.put("message", "Your return request has been submitted and will be reviewed within 2-3 business days");

        log.info("Return request created for order: {}", order.getOrderNumber());

        return response;
    }

    @Transactional(readOnly = true)
    public OrderSummaryResponse getUserOrderSummary(Long userId) {
        OrderSummaryResponse summary = new OrderSummaryResponse();

        summary.setTotalOrders(orderRepository.countByUserId(userId));
        summary.setPendingOrders(orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.PENDING));
        summary.setDeliveredOrders(orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED));
        summary.setCancelledOrders(orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.CANCELLED));
        summary.setTotalSpent(orderRepository.getTotalSpentByUser(userId));

        return summary;
    }

    public void addOrderReview(Long orderId, User user, Map<String, Object> review) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check if order belongs to user and is delivered
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to order");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Can only review delivered orders");
        }

        // Create review for each product in order
        for (OrderItem item : order.getOrderItems()) {
            Review productReview = new Review();
            productReview.setUser(user);
            productReview.setProduct(item.getProduct());
            productReview.setOrder(order);
            productReview.setRating((Integer) review.get("rating"));
            productReview.setComment((String) review.get("comment"));
            productReview.setVerifiedPurchase(true);
            productReview.setCreatedAt(LocalDateTime.now());

            reviewRepository.save(productReview);
        }

        log.info("Review added for order: {}", order.getOrderNumber());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calculateShipping(Map<String, Object> shippingDetails) {
        String postalCode = (String) shippingDetails.get("postalCode");
        BigDecimal orderValue = new BigDecimal(shippingDetails.get("orderValue").toString());

        Map<String, Object> shippingInfo = new HashMap<>();

        // Free shipping for orders above 500
        if (orderValue.compareTo(new BigDecimal("500")) >= 0) {
            shippingInfo.put("shippingCharge", BigDecimal.ZERO);
            shippingInfo.put("message", "Free shipping applied");
        } else {
            BigDecimal shippingCharge = shippingService.calculateShippingCharge(postalCode, orderValue);
            shippingInfo.put("shippingCharge", shippingCharge);
            shippingInfo.put("message", "Standard shipping charges apply");
        }

        shippingInfo.put("estimatedDelivery", shippingService.getEstimatedDeliveryDays(postalCode));

        return shippingInfo;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> validateCoupon(String couponCode, User user) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        Map<String, Object> result = new HashMap<>();

        // Check if coupon is active
        if (!coupon.isActive()) {
            result.put("valid", false);
            result.put("message", "Coupon is not active");
            return result;
        }

        // Check expiry date
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            result.put("valid", false);
            result.put("message", "Coupon has expired");
            return result;
        }

        // Check usage limit
        if (coupon.getMaxUsages() != null) {
            int usageCount = couponUsageRepository.countByCouponId(coupon.getId());
            if (usageCount >= coupon.getMaxUsages()) {
                result.put("valid", false);
                result.put("message", "Coupon usage limit exceeded");
                return result;
            }
        }

        // Check user usage limit
        if (coupon.getMaxUsagesPerUser() != null) {
            int userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), user.getId());
            if (userUsageCount >= coupon.getMaxUsagesPerUser()) {
                result.put("valid", false);
                result.put("message", "You have already used this coupon");
                return result;
            }
        }

        result.put("valid", true);
        result.put("discountType", coupon.getDiscountType());
        result.put("discountValue", coupon.getDiscountValue());
        result.put("minOrderAmount", coupon.getMinOrderAmount());
        result.put("message", "Coupon is valid");

        return result;
    }

    // Helper methods
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BigDecimal getProductPrice(Product product, User.CustomerType customerType) {
        if (customerType == User.CustomerType.BUSINESS && product.getBusinessPrice() != null) {
            return product.getBusinessPrice();
        }
        return product.getBasePrice();
    }

    private boolean isSameState(Address address) {
        // Check if shipping address is in same state as business
        // This is simplified - in production, you'd have proper business address
        // configuration
        return true; // Default to CGST+SGST
    }

    private BigDecimal calculateShipping(Address address, BigDecimal subtotal) {
        // Free shipping for orders above 500
        if (subtotal.compareTo(new BigDecimal("500")) >= 0) {
            return BigDecimal.ZERO;
        }

        // Calculate based on location
        return shippingService.calculateShippingCharge(address.getPostalCode(), subtotal);
    }

    private BigDecimal applyCoupon(String couponCode, BigDecimal subtotal, User user) {
        Map<String, Object> validation = validateCoupon(couponCode, user);

        if (!(Boolean) validation.get("valid")) {
            throw new RuntimeException((String) validation.get("message"));
        }

        BigDecimal minOrderAmount = (BigDecimal) validation.get("minOrderAmount");
        if (minOrderAmount != null && subtotal.compareTo(minOrderAmount) < 0) {
            throw new RuntimeException("Minimum order amount for this coupon is " + minOrderAmount);
        }

        String discountType = (String) validation.get("discountType");
        BigDecimal discountValue = (BigDecimal) validation.get("discountValue");

        BigDecimal discount;
        if ("PERCENTAGE".equals(discountType)) {
            discount = subtotal.multiply(discountValue).divide(BigDecimal.valueOf(100));
        } else {
            discount = discountValue;
        }

        // Record coupon usage
        CouponUsage usage = new CouponUsage();
        usage.setCouponId(couponRepository.findByCode(couponCode).get().getId());
        usage.setUserId(user.getId());
        usage.setUsedAt(LocalDateTime.now());
        couponUsageRepository.save(usage);

        return discount;
    }

    private int calculateLoyaltyPoints(BigDecimal amount) {
        // 1 point for every 10 rupees spent
        return amount.divide(BigDecimal.valueOf(10), 0, BigDecimal.ROUND_DOWN).intValue();
    }

    private boolean canBeCancelled(Order order) {
        return order.getStatus() == Order.OrderStatus.PENDING ||
                order.getStatus() == Order.OrderStatus.CONFIRMED ||
                order.getStatus() == Order.OrderStatus.PROCESSING;
    }

    private boolean isValidStatusTransition(Order.OrderStatus from, Order.OrderStatus to) {
        // Define valid status transitions
        Map<Order.OrderStatus, List<Order.OrderStatus>> validTransitions = Map.of(
                Order.OrderStatus.PENDING, List.of(Order.OrderStatus.CONFIRMED, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.CONFIRMED, List.of(Order.OrderStatus.PROCESSING, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.PROCESSING, List.of(Order.OrderStatus.PACKED, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.PACKED, List.of(Order.OrderStatus.SHIPPED),
                Order.OrderStatus.SHIPPED, List.of(Order.OrderStatus.OUT_FOR_DELIVERY, Order.OrderStatus.DELIVERED),
                Order.OrderStatus.OUT_FOR_DELIVERY, List.of(Order.OrderStatus.DELIVERED, Order.OrderStatus.RETURNED),
                Order.OrderStatus.DELIVERED, List.of(Order.OrderStatus.RETURNED));

        return validTransitions.getOrDefault(from, Collections.emptyList()).contains(to);
    }

    private void createStatusHistory(Order order, Order.OrderStatus from,
            Order.OrderStatus to, String notes) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setNotes(notes);
        history.setCreatedAt(LocalDateTime.now());

        orderStatusHistoryRepository.save(history);
    }

    private void releaseReservedStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            inventoryService.releaseReservedStock(item.getProduct().getId(), item.getQuantity());
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
            .anyMatch(role -> role.getName().equals("ADMIN"));
    }

private void sendOrderConfirmation(Order order) {
        // Send email
        emailService.sendOrderConfirmation(order);
        // Send SMS if enabled
        if (order.getUser().getPhoneNumber() != null) {
            smsService.sendOrderConfirmationSMS(order);
        }

        // Create notification
        notificationService.createNotification(
                order.getUser(),
                "Order Confirmed",
                "Your order #" + order.getOrderNumber() + " has been confirmed",
                "ORDER",
                order.getId());
    }

    private void sendCancellationNotification(Order order) {
        emailService.sendOrderCancellation(order);

        notificationService.createNotification(
                order.getUser(),
                "Order Cancelled",
                "Your order #" + order.getOrderNumber() + " has been cancelled",
                "ORDER",
                order.getId());
    }

    private void sendStatusUpdateNotification(Order order) {
        emailService.sendOrderStatusUpdate(order);

        notificationService.createNotification(
                order.getUser(),
                "Order Status Updated",
                "Your order #" + order.getOrderNumber() + " status: " + order.getStatus(),
                "ORDER",
                order.getId());
    }
}