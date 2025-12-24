package com.ecommerce.service;

import com.ecommerce.entity.Order;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class PaymentService {
    public PaymentResult processPayment(Order order, Map<String, Object> details) {
        return new PaymentResult(true, "mock-txn-id", "Success");
    }
    public void processRefund(Order order) {}
}