package com.ecommerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogResponse {
    private Long id;
    private String action;
    private String description;
    private String username;
    private String userRole;
    private String ipAddress;
    private LocalDateTime timestamp;
    private String entityType;
    private String entityId;
}