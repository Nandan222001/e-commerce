package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String description;

    private String username;
    private Long userId;
    private String userRole;
    private String ipAddress;

    private LocalDateTime createdAt;

    private String entityType;
    private String entityId;
}