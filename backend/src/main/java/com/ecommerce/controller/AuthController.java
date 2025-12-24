// src/main/java/com/ecommerce/controller/AuthController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.User;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String jwt = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            
            User user = (User) authentication.getPrincipal();
            
            // Update last login
            userService.updateLastLogin(user.getId());
            
            JwtAuthenticationResponse response = JwtAuthenticationResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .customerType(user.getCustomerType().toString())
                    .companyName(user.getCompanyName())
                    .gstNumber(user.getGstNumber())
                    .phoneNumber(user.getPhoneNumber())
                    .roles(user.getRoles())
                    .emailVerified(user.getEmailVerified())
                    .build())
                .build();
                
            log.info("User logged in successfully: {}", user.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Login failed for email: {}", loginRequest.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Registration attempt for email: {}", registerRequest.getEmail());
        
        try {
            // Check if email already exists
            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
            }

            // Check if phone number already exists
            if (registerRequest.getPhoneNumber() != null && 
                userService.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Phone number is already in use!"));
            }

            // Register user
            User user = authService.registerUser(registerRequest);
            
            // Generate tokens
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    registerRequest.getEmail(),
                    registerRequest.getPassword()
                )
            );
            
            String jwt = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            
            JwtAuthenticationResponse response = JwtAuthenticationResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .customerType(user.getCustomerType().toString())
                    .phoneNumber(user.getPhoneNumber())
                    .roles(user.getRoles())
                    .emailVerified(false)
                    .build())
                .build();
            
            log.info("User registered successfully: {}", user.getEmail());
            
            // Send verification email (async)
            authService.sendVerificationEmail(user);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Registration failed for email: {}", registerRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            
            if (tokenProvider.validateToken(refreshToken)) {
                String email = tokenProvider.getEmailFromToken(refreshToken);
                User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                String newAccessToken = tokenProvider.generateTokenFromEmail(email);
                
                RefreshTokenResponse response = RefreshTokenResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .build();
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid refresh token"));
            }
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Token refresh failed"));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate token")
    public ResponseEntity<?> logoutUser(@RequestHeader("Authorization") String token) {
        try {
            // Extract token from Bearer string
            String jwt = token.substring(7);
            
            // Add token to blacklist
            authService.blacklistToken(jwt);
            
            // Clear security context
            SecurityContextHolder.clearContext();
            
            log.info("User logged out successfully");
            return ResponseEntity.ok(new MessageResponse("User logged out successfully"));
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Logout failed"));
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send password reset link to email")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.sendPasswordResetEmail(request.getEmail());
            return ResponseEntity.ok(
                new MessageResponse("Password reset link sent to your email")
            );
        } catch (Exception e) {
            log.error("Password reset request failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to send password reset email"));
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(
                new MessageResponse("Password reset successfully")
            );
        } catch (Exception e) {
            log.error("Password reset failed", e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Invalid or expired reset token"));
        }
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verify user email address")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok(
                new MessageResponse("Email verified successfully")
            );
        } catch (Exception e) {
            log.error("Email verification failed", e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Invalid or expired verification token"));
        }
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resend email verification link")
    public ResponseEntity<?> resendVerificationEmail(@Valid @RequestBody ResendVerificationRequest request) {
        try {
            authService.resendVerificationEmail(request.getEmail());
            return ResponseEntity.ok(
                new MessageResponse("Verification email sent successfully")
            );
        } catch (Exception e) {
            log.error("Failed to resend verification email", e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to send verification email"));
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change user password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                           Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            authService.changePassword(user.getId(), request.getCurrentPassword(), 
                                      request.getNewPassword());
            return ResponseEntity.ok(
                new MessageResponse("Password changed successfully")
            );
        } catch (Exception e) {
            log.error("Password change failed", e);
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to change password: " + e.getMessage()));
        }
    }

    @GetMapping("/check-auth")
    @Operation(summary = "Check authentication", description = "Check if user is authenticated")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .build());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new MessageResponse("Not authenticated"));
    }
}