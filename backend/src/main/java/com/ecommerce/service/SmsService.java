package com.ecommerce.service;

import com.ecommerce.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmsService {

    @Async("taskExecutor")
    public void sendOrderConfirmationSMS(Order order) {
        if (order.getUser().getPhoneNumber() == null) {
            return;
        }

        // Mock implementation - In a real app, integrate Twilio, AWS SNS, etc.
        log.info("============== SMS SENT ==============");
        log.info("To: {}", order.getUser().getPhoneNumber());
        log.info("Message: Dear {}, your order #{} has been confirmed. Total Amount: {}", 
                order.getUser().getFirstName(),
                order.getOrderNumber(),
                order.getTotalAmount());
        log.info("======================================");
    }

    @Async("taskExecutor")
    public void sendOtp(String phoneNumber, String otp) {
        log.info("Sending OTP {} to {}", otp, phoneNumber);
    }
}