package com.ecommerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SupportTicketResponse {
    private Long id;
    private String ticketNumber;
    private String subject;
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private String priority;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketMessageResponse> messages;

    @Data
    public static class TicketMessageResponse {
        private String sender;
        private String message;
        private LocalDateTime timestamp;
        private boolean isAdmin;
    }
}