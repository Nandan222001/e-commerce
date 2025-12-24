// src/main/java/com/ecommerce/service/EmailService.java
package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    public void sendEmail(String to, String subject, String template, Map<String, Object> variables) {
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail, appName);
                helper.setTo(to);
                helper.setSubject(subject);

                Context context = new Context();
                context.setVariables(variables);
                context.setVariable("appName", appName);

                String htmlContent = templateEngine.process(template, context);
                helper.setText(htmlContent, true);

                mailSender.send(message);

                log.info("Email sent successfully to: {}", to);
            } catch (Exception e) {
                log.error("Failed to send email to: {}", to, e);
            }
        });
    }

    public void sendOrderConfirmation(Order order) {
        Map<String, Object> variables = Map.of(
                "userName", order.getUser().getFirstName(),
                "orderNumber", order.getOrderNumber(),
                "order", order,
                "totalAmount", order.getTotalAmount());

        sendEmail(
                order.getUser().getEmail(),
                "Order Confirmation - #" + order.getOrderNumber(),
                "order-confirmation",
                variables);
    }

    public void sendOrderStatusUpdate(Order order) {
        Map<String, Object> variables = Map.of(
                "userName", order.getUser().getFirstName(),
                "orderNumber", order.getOrderNumber(),
                "status", order.getStatus(),
                "trackingNumber", order.getTrackingNumber() != null ? order.getTrackingNumber() : "");

        sendEmail(
                order.getUser().getEmail(),
                "Order Status Update - #" + order.getOrderNumber(),
                "order-status-update",
                variables);
    }

    public void sendOrderCancellation(Order order) {
        Map<String, Object> variables = Map.of(
                "userName", order.getUser().getFirstName(),
                "orderNumber", order.getOrderNumber(),
                "reason", order.getCancellationReason() != null ? order.getCancellationReason() : "Customer request");

        sendEmail(
                order.getUser().getEmail(),
                "Order Cancelled - #" + order.getOrderNumber(),
                "order-cancellation",
                variables);
    }

    public void sendLowStockAlert(Product product) {
        Map<String, Object> variables = Map.of(
                "productName", product.getName(),
                "sku", product.getSku(),
                "currentStock", product.getStockQuantity(),
                "minStock", product.getMinStockLevel());

        // Send to admin email
        sendEmail(
                "admin@ecommerce.com",
                "Low Stock Alert - " + product.getName(),
                "low-stock-alert",
                variables);
    }

    public void sendWelcomeEmail(User user) {
        Map<String, Object> variables = Map.of(
                "userName", user.getFirstName(),
                "customerType", user.getCustomerType());

        sendEmail(
                user.getEmail(),
                "Welcome to " + appName,
                "welcome",
                variables);
    }
}