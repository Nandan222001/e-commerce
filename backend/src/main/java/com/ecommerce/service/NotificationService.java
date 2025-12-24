package com.ecommerce.service;

import com.ecommerce.entity.Product;
import com.ecommerce.entity.ReturnRequest;
import com.ecommerce.entity.User;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void createNotification(User user, String title, String message, String type, Long refId) {}
    public void sendLowStockAlert(Product product) {}
    public void sendReturnRequestNotification(ReturnRequest request) {}
}