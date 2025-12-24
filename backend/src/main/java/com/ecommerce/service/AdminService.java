// src/main/java/com/ecommerce/service/AdminService.java
package com.ecommerce.service;

import com.ecommerce.dto.response.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SystemSettingsRepository settingsRepository;

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // Get current month stats
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        // Revenue stats
        BigDecimal currentMonthRevenue = orderRepository.getRevenueByDateRange(startOfMonth, now);
        BigDecimal lastMonthRevenue = orderRepository.getRevenueByDateRange(
                startOfMonth.minusMonths(1), startOfMonth);

        stats.setTotalRevenue(currentMonthRevenue);
        stats.setRevenueChange(calculatePercentageChange(currentMonthRevenue, lastMonthRevenue));

        // Order stats
        Long currentMonthOrders = orderRepository.countByCreatedAtBetween(startOfMonth, now);
        Long lastMonthOrders = orderRepository.countByCreatedAtBetween(
                startOfMonth.minusMonths(1), startOfMonth);

        stats.setTotalOrders(currentMonthOrders);
        stats.setOrdersChange(calculatePercentageChange(
                BigDecimal.valueOf(currentMonthOrders),
                BigDecimal.valueOf(lastMonthOrders)));

        // Customer stats
        Long currentMonthCustomers = userRepository.countNewCustomers(startOfMonth, now);
        Long lastMonthCustomers = userRepository.countNewCustomers(
                startOfMonth.minusMonths(1), startOfMonth);

        stats.setTotalCustomers(currentMonthCustomers);
        stats.setCustomersChange(calculatePercentageChange(
                BigDecimal.valueOf(currentMonthCustomers),
                BigDecimal.valueOf(lastMonthCustomers)));

        // Product stats
        stats.setTotalProducts(productRepository.countByActiveTrue());
        stats.setLowStockProducts(productRepository.countLowStockProducts());
        stats.setOutOfStockProducts(productRepository.countOutOfStockProducts());

        // Recent activity
        stats.setPendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING));
        stats.setProcessingOrders(orderRepository.countByStatus(Order.OrderStatus.PROCESSING));
        stats.setCompletedOrders(orderRepository.countByStatus(Order.OrderStatus.DELIVERED));

        // Today's stats
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        stats.setTodayRevenue(orderRepository.getRevenueByDateRange(startOfDay, now));
        stats.setTodayOrders(orderRepository.countByCreatedAtBetween(startOfDay, now));

        return stats;
    }

    public List<OrderResponse> getRecentOrders(int limit) {
        List<Order> orders = orderRepository.findRecentOrders(PageRequest.of(0, limit));
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getSalesData(String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> salesData = new HashMap<>();

        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<Map<String, Object>> data = new ArrayList<>();

        switch (period.toUpperCase()) {
            case "DAILY":
                data = orderRepository.getDailySales(startDate, endDate);
                break;
            case "WEEKLY":
                data = orderRepository.getWeeklySales(startDate, endDate);
                break;
            case "MONTHLY":
                data = orderRepository.getMonthlySales(startDate, endDate);
                break;
            case "YEARLY":
                data = orderRepository.getYearlySales(startDate.getYear(), endDate.getYear());
                break;
        }

        salesData.put("period", period);
        salesData.put("startDate", startDate);
        salesData.put("endDate", endDate);
        salesData.put("data", data);

        return salesData;
    }

    public List<Map<String, Object>> getCategorySales() {
        return categoryRepository.getCategorySalesStats();
    }

    public Map<String, Object> getSystemSettings() {
        Map<String, Object> settings = new HashMap<>();

        List<SystemSetting> allSettings = settingsRepository.findAll();
        for (SystemSetting setting : allSettings) {
            settings.put(setting.getKey(), setting.getValue());
        }

        return settings;
    }

    @Transactional
    public Map<String, Object> updateSystemSettings(Map<String, Object> settings) {
        for (Map.Entry<String, Object> entry : settings.entrySet()) {
            SystemSetting setting = settingsRepository.findByKey(entry.getKey())
                    .orElse(new SystemSetting());

            setting.setKey(entry.getKey());
            setting.setValue(entry.getValue().toString());
            setting.setUpdatedAt(LocalDateTime.now());

            settingsRepository.save(setting);
        }

        log.info("System settings updated");

        return getSystemSettings();
    }

    private double calculatePercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        BigDecimal change = current.subtract(previous)
                .divide(previous, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return change.doubleValue();
    }
}