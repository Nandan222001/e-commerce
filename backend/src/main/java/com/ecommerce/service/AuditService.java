package com.ecommerce.service;

import com.ecommerce.dto.response.AuditLogResponse;
import com.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditService {
    public void logAction(String action, String description, User user) {}
    public Page<AuditLogResponse> getAuditLogs(String action, String userId, LocalDateTime start, LocalDateTime end, Pageable pageable) { return Page.empty(); }
}