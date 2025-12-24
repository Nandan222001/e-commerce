package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private Double revenueChange;
    private Long totalOrders;
    private Double ordersChange;
    private Long totalCustomers;
    private Double customersChange;
    private Long totalProducts;
    private Double productsChange;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    private Long pendingOrders;
    private Long processingOrders;
    private Long completedOrders;
    private BigDecimal todayRevenue;
    private Long todayOrders;
}