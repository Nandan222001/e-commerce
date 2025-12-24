// src/main/java/com/ecommerce/controller/UserController.java
package com.ecommerce.controller;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.core.io.ByteArrayResource;
import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.User;
import com.ecommerce.service.UserService;
import com.ecommerce.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User management APIs")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;
    private final AddressService addressService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get current user's profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching profile for user: {}", user.getEmail());
        
        UserProfileResponse profile = userService.getUserProfile(user.getId());
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile", description = "Update user profile information")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Updating profile for user: {}", user.getEmail());
        
        UserProfileResponse profile = userService.updateProfile(user.getId(), request);
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/avatar")
    @Operation(summary = "Upload avatar", description = "Upload user avatar image")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("avatar") MultipartFile file,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Uploading avatar for user: {}", user.getEmail());
        
        String avatarUrl = userService.uploadAvatar(user.getId(), file);
        
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    // Address endpoints
    @GetMapping("/addresses")
    @Operation(summary = "Get user addresses", description = "Get all addresses for current user")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching addresses for user: {}", user.getEmail());
        
        List<AddressResponse> addresses = addressService.getUserAddresses(user.getId());
        
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/addresses")
    @Operation(summary = "Add address", description = "Add a new address")
    public ResponseEntity<AddressResponse> addAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Adding address for user: {}", user.getEmail());
        
        AddressResponse address = addressService.addAddress(user.getId(), request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(address);
    }

    @PutMapping("/addresses/{addressId}")
    @Operation(summary = "Update address", description = "Update existing address")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Updating address {} for user: {}", addressId, user.getEmail());
        
        AddressResponse address = addressService.updateAddress(user.getId(), addressId, request);
        
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/addresses/{addressId}")
    @Operation(summary = "Delete address", description = "Delete an address")
    public ResponseEntity<Map<String, String>> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Deleting address {} for user: {}", addressId, user.getEmail());
        
        addressService.deleteAddress(user.getId(), addressId);
        
        return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
    }

    @PatchMapping("/addresses/{addressId}/set-default")
    @Operation(summary = "Set default address", description = "Set an address as default")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Setting default address {} for user: {}", addressId, user.getEmail());
        
        AddressResponse address = addressService.setDefaultAddress(user.getId(), addressId);
        
        return ResponseEntity.ok(address);
    }

    // Wishlist endpoints
    @GetMapping("/wishlist")
    @Operation(summary = "Get wishlist", description = "Get user's wishlist items")
    public ResponseEntity<List<ProductResponse>> getWishlist(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("Fetching wishlist for user: {}", user.getEmail());
        
        List<ProductResponse> wishlist = userService.getWishlist(user.getId());
        
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/wishlist/{productId}")
    @Operation(summary = "Add to wishlist", description = "Add product to wishlist")
    public ResponseEntity<Map<String, String>> addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Adding product {} to wishlist for user: {}", productId, user.getEmail());
        
        userService.addToWishlist(user.getId(), productId);
        
        return ResponseEntity.ok(Map.of("message", "Product added to wishlist"));
    }

    @DeleteMapping("/wishlist/{productId}")
    @Operation(summary = "Remove from wishlist", description = "Remove product from wishlist")
    public ResponseEntity<Map<String, String>> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Removing product {} from wishlist for user: {}", productId, user.getEmail());
        
        userService.removeFromWishlist(user.getId(), productId);
        
        return ResponseEntity.ok(Map.of("message", "Product removed from wishlist"));
    }

    // Notification preferences
    @GetMapping("/notifications/preferences")
    @Operation(summary = "Get notification preferences", description = "Get user notification preferences")
    public ResponseEntity<NotificationPreferencesResponse> getNotificationPreferences(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching notification preferences for user: {}", user.getEmail());

        NotificationPreferencesResponse preferences = userService.getNotificationPreferences(user.getId());

        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/notifications/preferences")
    @Operation(summary = "Update notification preferences", description = "Update notification settings")
    public ResponseEntity<NotificationPreferencesResponse> updateNotificationPreferences(
            @Valid @RequestBody NotificationPreferencesRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Updating notification preferences for user: {}", user.getEmail());

        NotificationPreferencesResponse preferences = userService.updateNotificationPreferences(
                user.getId(), request);

        return ResponseEntity.ok(preferences);
    }

    @GetMapping("/notifications")
    @Operation(summary = "Get notifications", description = "Get user notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching notifications for user: {}", user.getEmail());

        List<NotificationResponse> notifications = userService.getNotifications(
                user.getId(), unreadOnly);

        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/notifications/{notificationId}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a notification as read")
    public ResponseEntity<Map<String, String>> markNotificationAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Marking notification {} as read for user: {}", notificationId, user.getEmail());

        userService.markNotificationAsRead(user.getId(), notificationId);

        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PostMapping("/notifications/mark-all-read")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllNotificationsAsRead(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Marking all notifications as read for user: {}", user.getEmail());

        userService.markAllNotificationsAsRead(user.getId());

        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // Recently viewed products
    @GetMapping("/recently-viewed")
    @Operation(summary = "Get recently viewed", description = "Get recently viewed products")
    public ResponseEntity<List<ProductResponse>> getRecentlyViewedProducts(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching recently viewed products for user: {}", user.getEmail());

        List<ProductResponse> products = userService.getRecentlyViewedProducts(user.getId());

        return ResponseEntity.ok(products);
    }

    // User preferences
    @GetMapping("/preferences")
    @Operation(summary = "Get preferences", description = "Get user preferences")
    public ResponseEntity<UserPreferencesResponse> getUserPreferences(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching preferences for user: {}", user.getEmail());

        UserPreferencesResponse preferences = userService.getUserPreferences(user.getId());

        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update preferences", description = "Update user preferences")
    public ResponseEntity<UserPreferencesResponse> updateUserPreferences(
            @Valid @RequestBody UserPreferencesRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Updating preferences for user: {}", user.getEmail());

        UserPreferencesResponse preferences = userService.updateUserPreferences(
                user.getId(), request);

        return ResponseEntity.ok(preferences);
    }

    // Order history and statistics
    @GetMapping("/order-history")
    @Operation(summary = "Get order history", description = "Get user's order history")
    public ResponseEntity<OrderHistoryResponse> getOrderHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching order history for user: {}", user.getEmail());

        OrderHistoryResponse history = userService.getOrderHistory(user.getId(), page, size);

        return ResponseEntity.ok(history);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get user statistics", description = "Get user account statistics")
    public ResponseEntity<UserStatisticsResponse> getUserStatistics(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching statistics for user: {}", user.getEmail());

        UserStatisticsResponse statistics = userService.getUserStatistics(user.getId());

        return ResponseEntity.ok(statistics);
    }

    // Loyalty points
    @GetMapping("/loyalty-points")
    @Operation(summary = "Get loyalty points", description = "Get user's loyalty points balance")
    public ResponseEntity<LoyaltyPointsResponse> getLoyaltyPoints(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching loyalty points for user: {}", user.getEmail());

        LoyaltyPointsResponse points = userService.getLoyaltyPoints(user.getId());

        return ResponseEntity.ok(points);
    }

    @GetMapping("/loyalty-points/history")
    @Operation(summary = "Get points history", description = "Get loyalty points transaction history")
    public ResponseEntity<List<PointsTransactionResponse>> getPointsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching points history for user: {}", user.getEmail());

        List<PointsTransactionResponse> history = userService.getPointsHistory(
                user.getId(), page, size);

        return ResponseEntity.ok(history);
    }

    @PostMapping("/loyalty-points/redeem")
    @Operation(summary = "Redeem points", description = "Redeem loyalty points for rewards")
    public ResponseEntity<RedemptionResponse> redeemPoints(
            @Valid @RequestBody RedeemPointsRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Redeeming {} points for user: {}", request.getPoints(), user.getEmail());

        RedemptionResponse redemption = userService.redeemPoints(user.getId(), request);

        return ResponseEntity.ok(redemption);
    }

    // Reviews and ratings
    @GetMapping("/reviews")
    @Operation(summary = "Get user reviews", description = "Get reviews written by user")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching reviews for user: {}", user.getEmail());

        List<ReviewResponse> reviews = userService.getUserReviews(user.getId());

        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/reviews")
    @Operation(summary = "Write review", description = "Write a product review")
    public ResponseEntity<ReviewResponse> writeReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Creating review for product {} by user: {}",
                request.getProductId(), user.getEmail());

        ReviewResponse review = userService.createReview(user.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PutMapping("/reviews/{reviewId}")
    @Operation(summary = "Update review", description = "Update existing review")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Updating review {} by user: {}", reviewId, user.getEmail());

        ReviewResponse review = userService.updateReview(user.getId(), reviewId, request);

        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/reviews/{reviewId}")
    @Operation(summary = "Delete review", description = "Delete a review")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Deleting review {} by user: {}", reviewId, user.getEmail());

        userService.deleteReview(user.getId(), reviewId);

        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }

    // Support tickets
    @GetMapping("/support/tickets")
    @Operation(summary = "Get support tickets", description = "Get user's support tickets")
    public ResponseEntity<List<SupportTicketResponse>> getSupportTickets(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching support tickets for user: {}", user.getEmail());

        List<SupportTicketResponse> tickets = userService.getSupportTickets(user.getId());

        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/support/tickets")
    @Operation(summary = "Create support ticket", description = "Create a new support ticket")
    public ResponseEntity<SupportTicketResponse> createSupportTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Creating support ticket for user: {}", user.getEmail());

        SupportTicketResponse ticket = userService.createSupportTicket(user.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    // Referral program
    @GetMapping("/referral")
    @Operation(summary = "Get referral info", description = "Get user's referral information")
    public ResponseEntity<ReferralInfoResponse> getReferralInfo(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Fetching referral info for user: {}", user.getEmail());

        ReferralInfoResponse referralInfo = userService.getReferralInfo(user.getId());

        return ResponseEntity.ok(referralInfo);
    }

    @PostMapping("/referral/invite")
    @Operation(summary = "Send referral invite", description = "Send referral invitation")
    public ResponseEntity<Map<String, String>> sendReferralInvite(
            @Valid @RequestBody ReferralInviteRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Sending referral invite from user: {}", user.getEmail());

        userService.sendReferralInvite(user.getId(), request);

        return ResponseEntity.ok(Map.of(
                "message", "Referral invitation sent successfully",
                "referralCode", user.getReferralCode()));
    }

    // Account deletion
    @DeleteMapping("/account")
    @Operation(summary = "Delete account", description = "Delete user account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Account deletion requested by user: {}", user.getEmail());

        userService.deleteAccount(user.getId(), request);

        return ResponseEntity.ok(Map.of(
                "message", "Account deletion initiated. You will receive a confirmation email."));
    }

    // Export user data (GDPR compliance)
    @GetMapping("/data-export")
    @Operation(summary = "Export user data", description = "Export all user data (GDPR)")
    public ResponseEntity<ByteArrayResource> exportUserData(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Data export requested by user: {}", user.getEmail());

        byte[] userData = userService.exportUserData(user.getId());

        ByteArrayResource resource = new ByteArrayResource(userData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=user_data_" + user.getId() + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .contentLength(userData.length)
                .body(resource);
    }
}