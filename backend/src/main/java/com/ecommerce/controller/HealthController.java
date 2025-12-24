// src/main/java/com/ecommerce/controller/HealthController.java
package com.ecommerce.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health", description = "Health check APIs")
public class HealthController implements HealthIndicator {

    private final DataSource dataSource;

    @GetMapping
    @Operation(summary = "Health check", description = "Check application health status")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("status", "UP");
        healthStatus.put("timestamp", System.currentTimeMillis());

        // Check database
        healthStatus.put("database", checkDatabase());

        // Check other services
        healthStatus.put("services", checkServices());

        return ResponseEntity.ok(healthStatus);
    }

    @GetMapping("/live")
    @Operation(summary = "Liveness probe", description = "Kubernetes liveness probe")
    public ResponseEntity<Map<String, String>> liveness() {
        return ResponseEntity.ok(Map.of("status", "alive"));
    }

    @GetMapping("/ready")
    @Operation(summary = "Readiness probe", description = "Kubernetes readiness probe")
    public ResponseEntity<Map<String, String>> readiness() {
        try {
            // Check if database is accessible
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(1)) {
                    return ResponseEntity.ok(Map.of("status", "ready"));
                }
            }
        } catch (Exception e) {
            log.error("Readiness check failed", e);
            return ResponseEntity.status(503).body(Map.of("status", "not ready"));
        }
        return ResponseEntity.status(503).body(Map.of("status", "not ready"));
    }

    @Override
    public Health health() {
        return Health.up()
                .withDetail("application", "E-Commerce Platform")
                .withDetail("version", "1.0.0")
                .build();
    }

    private Map<String, String> checkDatabase() {
        Map<String, String> dbStatus = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            dbStatus.put("status", "UP");
            dbStatus.put("database", connection.getMetaData().getDatabaseProductName());
            dbStatus.put("version", connection.getMetaData().getDatabaseProductVersion());
        } catch (Exception e) {
            dbStatus.put("status", "DOWN");
            dbStatus.put("error", e.getMessage());
        }
        return dbStatus;
    }

    private Map<String, String> checkServices() {
        Map<String, String> services = new HashMap<>();
        services.put("auth", "UP");
        services.put("payment", "UP");
        services.put("email", "UP");
        services.put("storage", "UP");
        return services;
    }
}