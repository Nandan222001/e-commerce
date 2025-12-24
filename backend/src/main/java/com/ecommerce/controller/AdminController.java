// src/main/java/com/ecommerce/controller/AdminController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.User;
import com.ecommerce.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "Admin management APIs")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;
    private final InventoryService inventoryService;
    private final ReportService reportService;
    private final AuditService auditService;

    // Dashboard endpoints
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics", description = "Get admin dashboard statistics")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        log.info("Fetching dashboard statistics");

        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard/recent-orders")
    @Operation(summary = "Get recent orders", description = "Get list of recent orders")
    public ResponseEntity<List<OrderResponse>> getRecentOrders(
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Fetching recent {} orders", limit);

        List<OrderResponse> orders = adminService.getRecentOrders(limit);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/dashboard/sales")
    @Operation(summary = "Get sales data", description = "Get sales data for charts")
    public ResponseEntity<Map<String, Object>> getSalesData(
            @RequestParam(defaultValue = "MONTHLY") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching sales data for period: {}", period);

        Map<String, Object> salesData = adminService.getSalesData(period, startDate, endDate);
        return ResponseEntity.ok(salesData);
    }

    @GetMapping("/dashboard/category-sales")
    @Operation(summary = "Get category sales", description = "Get sales by category")
    public ResponseEntity<List<Map<String, Object>>> getCategorySales() {
        log.info("Fetching category sales data");

        List<Map<String, Object>> categorySales = adminService.getCategorySales();
        return ResponseEntity.ok(categorySales);
    }

    // Product management endpoints
    @PostMapping("/products")
    @Operation(summary = "Create product", description = "Create a new product")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Creating product by admin: {}", admin.getEmail());

        ProductResponse product = productService.createProduct(request, admin);

        auditService.logAction("PRODUCT_CREATED", "Product created: " + product.getName(), admin);

        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/products/{productId}")
    @Operation(summary = "Update product", description = "Update existing product")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductUpdateRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Updating product {} by admin: {}", productId, admin.getEmail());

        ProductResponse product = productService.updateProduct(productId, request, admin);

        auditService.logAction("PRODUCT_UPDATED", "Product updated: " + product.getName(), admin);

        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/products/{productId}")
    @Operation(summary = "Delete product", description = "Delete a product")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @PathVariable Long productId,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Deleting product {} by admin: {}", productId, admin.getEmail());

        productService.deleteProduct(productId);

        auditService.logAction("PRODUCT_DELETED", "Product deleted: " + productId, admin);

        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    @PatchMapping("/products/{productId}/toggle-status")
    @Operation(summary = "Toggle product status", description = "Enable or disable a product")
    public ResponseEntity<ProductResponse> toggleProductStatus(
            @PathVariable Long productId,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Toggling product {} status by admin: {}", productId, admin.getEmail());

        ProductResponse product = productService.toggleProductStatus(productId, admin);

        auditService.logAction("PRODUCT_STATUS_CHANGED",
                "Product status changed: " + product.getName(), admin);

        return ResponseEntity.ok(product);
    }

    @PatchMapping("/products/{productId}/stock")
    @Operation(summary = "Update product stock", description = "Update product stock quantity")
    public ResponseEntity<Map<String, Object>> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Updating stock for product {} by admin: {}", productId, admin.getEmail());

        inventoryService.updateStock(productId, request.getQuantity(), request.isDeduction());

        auditService.logAction("STOCK_UPDATED",
                String.format("Stock updated for product %d: %s %d",
                        productId,
                        request.isDeduction() ? "deducted" : "added",
                        request.getQuantity()),
                admin);

        return ResponseEntity.ok(Map.of(
                "message", "Stock updated successfully",
                "productId", productId,
                "quantityChanged", request.getQuantity(),
                "operation", request.isDeduction() ? "DEDUCTION" : "ADDITION"));
    }

    @PostMapping("/products/{productId}/images")
    @Operation(summary = "Upload product images", description = "Upload images for a product")
    public ResponseEntity<List<String>> uploadProductImages(
            @PathVariable Long productId,
            @RequestParam("images") List<MultipartFile> images,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Uploading images for product {} by admin: {}", productId, admin.getEmail());

        List<String> imageUrls = productService.uploadProductImages(productId, images);

        return ResponseEntity.ok(imageUrls);
    }

    // Order management endpoints
    @GetMapping("/orders")
    @Operation(summary = "Get all orders", description = "Get paginated list of all orders")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        log.info("Fetching all orders - page: {}, size: {}", page, size);

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<OrderResponse> orders = orderService.getAllOrders(status, search, pageable);

        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Update order status", description = "Update the status of an order")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Updating order {} status to {} by admin: {}",
                orderId, request.getStatus(), admin.getEmail());

        OrderResponse order = orderService.updateOrderStatus(
                orderId, request.getStatus(), request.getNotes(), admin);

        auditService.logAction("ORDER_STATUS_UPDATED",
                String.format("Order %s status updated to %s", order.getOrderNumber(), request.getStatus()),
                admin);

        return ResponseEntity.ok(order);
    }

    @PatchMapping("/orders/{orderId}/payment-status")
    @Operation(summary = "Update payment status", description = "Update payment status of an order")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody Map<String, String> request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        String paymentStatus = request.get("status");

        log.info("Updating order {} payment status to {} by admin: {}",
                orderId, paymentStatus, admin.getEmail());

        OrderResponse order = orderService.updatePaymentStatus(orderId, paymentStatus);

        auditService.logAction("PAYMENT_STATUS_UPDATED",
                String.format("Order %d payment status updated to %s", orderId, paymentStatus),
                admin);

        return ResponseEntity.ok(order);
    }

    // User management endpoints
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Get paginated list of all users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String customerType) {

        log.info("Fetching all users - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);

        Page<UserResponse> users = userService.getAllUsers(search, role, customerType, pageable);

        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user details", description = "Get detailed information about a user")
    public ResponseEntity<UserDetailResponse> getUserDetails(@PathVariable Long userId) {
        log.info("Fetching details for user: {}", userId);

        UserDetailResponse user = userService.getUserDetails(userId);

        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Toggle user status", description = "Enable or disable a user account")
    public ResponseEntity<UserResponse> toggleUserStatus(
            @PathVariable Long userId,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Toggling user {} status by admin: {}", userId, admin.getEmail());

        UserResponse user = userService.toggleUserStatus(userId);

        auditService.logAction("USER_STATUS_CHANGED",
                String.format("User %d status changed", userId), admin);

        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user role", description = "Change user role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        String newRole = request.get("role");

        log.info("Updating user {} role to {} by admin: {}", userId, newRole, admin.getEmail());

        UserResponse user = userService.updateUserRole(userId, newRole);

        auditService.logAction("USER_ROLE_UPDATED",
                String.format("User %d role updated to %s", userId, newRole), admin);

        return ResponseEntity.ok(user);
    }

    // Inventory management endpoints
    @GetMapping("/inventory")
    @Operation(summary = "Get inventory", description = "Get inventory status for all products")
    public ResponseEntity<Page<InventoryResponse>> getInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean lowStock) {

        log.info("Fetching inventory - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);

        Page<InventoryResponse> inventory = inventoryService.getInventory(search, lowStock, pageable);

        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/inventory/stats")
    @Operation(summary = "Get inventory statistics", description = "Get inventory statistics")
    public ResponseEntity<InventoryStatsResponse> getInventoryStats() {
        log.info("Fetching inventory statistics");

        InventoryStatsResponse stats = inventoryService.getInventoryStats();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/inventory/low-stock")
    @Operation(summary = "Get low stock items", description = "Get products with low stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        log.info("Fetching low stock items");

        List<InventoryResponse> items = inventoryService.getLowStockItems();

        return ResponseEntity.ok(items);
    }

    @PostMapping("/inventory/adjust")
    @Operation(summary = "Adjust inventory", description = "Make inventory adjustment")
    public ResponseEntity<Map<String, Object>> adjustInventory(
            @Valid @RequestBody InventoryAdjustmentRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Adjusting inventory by admin: {}", admin.getEmail());

        inventoryService.adjustInventory(request, admin);

        auditService.logAction("INVENTORY_ADJUSTED",
                String.format("Inventory adjusted for product %d: %s",
                        request.getProductId(), request.getReason()),
                admin);

        return ResponseEntity.ok(Map.of(
                "message", "Inventory adjusted successfully",
                "adjustment", request));
    }

    // Audit log endpoints
    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs", description = "Get system audit logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        log.info("Fetching audit logs");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AuditLogResponse> logs = auditService.getAuditLogs(
                action, userId, startDate, endDate, pageable);

        return ResponseEntity.ok(logs);
    }

    // Settings endpoints
    @GetMapping("/settings")
    @Operation(summary = "Get system settings", description = "Get system configuration settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        log.info("Fetching system settings");

        Map<String, Object> settings = adminService.getSystemSettings();

        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    @Operation(summary = "Update system settings", description = "Update system configuration")
    public ResponseEntity<Map<String, Object>> updateSettings(
            @Valid @RequestBody Map<String, Object> settings,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Updating system settings by admin: {}", admin.getEmail());

        Map<String, Object> updatedSettings = adminService.updateSystemSettings(settings);

        auditService.logAction("SETTINGS_UPDATED", "System settings updated", admin);

        return ResponseEntity.ok(updatedSettings);
    }
}