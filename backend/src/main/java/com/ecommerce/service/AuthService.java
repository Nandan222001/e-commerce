// src/main/java/com/ecommerce/service/AuthService.java
package com.ecommerce.service;

import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.entity.VerificationToken;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.InvalidTokenException;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.VerificationTokenRepository;
import com.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Token blacklist for logout
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public User registerUser(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCustomerType(User.CustomerType.valueOf(request.getCustomerType()));

        // Set business details if applicable
        if (user.getCustomerType() == User.CustomerType.BUSINESS) {
            user.setCompanyName(request.getCompanyName());
            user.setGstNumber(request.getGstNumber());
        }

        // Set default role
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        user.setRoles(Set.of(customerRole));

        // Set account status
        user.setActive(true);
        user.setEmailVerified(false);
        user.setCreatedAt(LocalDateTime.now());

        // Save user
        user = userRepository.save(user);

        // Generate verification token
        String token = generateVerificationToken(user);

        // Send verification email
        sendVerificationEmail(user);

        log.info("User registered successfully: {}", user.getEmail());
        return user;
    }

    public void sendVerificationEmail(User user) {
        try {
            String token = UUID.randomUUID().toString();

            VerificationToken verificationToken = new VerificationToken();
            verificationToken.setToken(token);
            verificationToken.setUser(user);
            verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));

            tokenRepository.save(verificationToken);

            String verificationUrl = frontendUrl + "/verify-email?token=" + token;

            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", user.getFirstName());
            variables.put("verificationUrl", verificationUrl);

            emailService.sendEmail(
                    user.getEmail(),
                    "Verify Your Email Address",
                    "email-verification",
                    variables);

            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email", e);
        }
    }

    public void verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Delete used token
        tokenRepository.delete(verificationToken);

        log.info("Email verified for user: {}", user.getEmail());
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Delete existing tokens
        tokenRepository.deleteByUserId(user.getId());

        // Send new verification email
        sendVerificationEmail(user);
    }

    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = UUID.randomUUID().toString();

        VerificationToken resetToken = new VerificationToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setTokenType("PASSWORD_RESET");
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(2));

        tokenRepository.save(resetToken);

        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        Map<String, Object> variables = new HashMap<>();
        variables.put("userName", user.getFirstName());
        variables.put("resetUrl", resetUrl);

        emailService.sendEmail(
                user.getEmail(),
                "Password Reset Request",
                "password-reset",
                variables);

        log.info("Password reset email sent to: {}", email);
    }

    public void resetPassword(String token, String newPassword) {
        VerificationToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete used token
        tokenRepository.delete(resetToken);

        // Send confirmation email
        Map<String, Object> variables = new HashMap<>();
        variables.put("userName", user.getFirstName());

        emailService.sendEmail(
                user.getEmail(),
                "Password Reset Successful",
                "password-reset-success",
                variables);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
    }

    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
        log.info("Token blacklisted");
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    private String generateVerificationToken(User user) {
        return UUID.randomUUID().toString();
    }

    // Clean up expired tokens periodically
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up expired tokens");
    }
}