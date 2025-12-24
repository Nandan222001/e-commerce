package com.ecommerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type; // ORDER, SYSTEM, PROMOTION
    private boolean read;
    private LocalDateTime createdAt;
    private String actionUrl;
}