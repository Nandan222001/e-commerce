// src/main/java/com/ecommerce/service/UserService.java
package com.ecommerce.service;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.UserMapper;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.WishlistRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.NotificationRepository;
import com.ecommerce.repository.NotificationPreferencesRepository;
import com.ecommerce.repository.RecentlyViewedRepository;
import com.ecommerce.repository.LoyaltyPointsRepository;
import com.ecommerce.service.FileStorageService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WishlistRepository wishlistRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationPreferencesRepository preferencesRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    public void updateLastLogin(Long userId) {
        userRepository.updateLastLogin(userId, LocalDateTime.now());
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        if (user.getCustomerType() == User.CustomerType.BUSINESS) {
            user.setCompanyName(request.getCompanyName());
            user.setGstNumber(request.getGstNumber());
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        log.info("Profile updated for user: {}", user.getEmail());

        return userMapper.toProfileResponse(user);
    }

    public String uploadAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteFile(user.getAvatarUrl());
        }

        // Upload new avatar
        String avatarUrl = fileStorageService.uploadFile(file, "avatars/" + userId);

        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        log.info("Avatar uploaded for user: {}", user.getEmail());

        return avatarUrl;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String search, String role, String customerType,
            Pageable pageable) {
        Page<User> users;

        if (search != null && !search.isEmpty()) {
            users = userRepository.searchUsers(search, pageable);
        } else if (role != null && !role.isEmpty()) {
            users = userRepository.findByRole(role, pageable);
        } else if (customerType != null && !customerType.isEmpty()) {
            users = userRepository.findByCustomerType(
                    User.CustomerType.valueOf(customerType), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(userMapper::toResponse);
    }

    public UserDetailResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetailResponse response = userMapper.toDetailResponse(user);

        // Add additional details
        response.setTotalOrders(userRepository.countUserOrders(userId));
        response.setTotalSpent(userRepository.getTotalSpent(userId));
        response.setLoyaltyPoints(getLoyaltyPointsBalance(userId));

        return response;
    }

    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setActive(!user.getActive());
        user = userRepository.save(user);

        log.info("User status toggled for: {}", user.getEmail());

        return userMapper.toResponse(user);
    }

    public UserResponse updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        user.setRoles(Set.of(role));
        user = userRepository.save(user);

        log.info("User role updated for: {} to {}", user.getEmail(), roleName);

        return userMapper.toResponse(user);
    }

    // Wishlist management
    public List<ProductResponse> getWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        return wishlistItems.stream()
                .map(item -> productMapper.toResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    public void addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if already in wishlist
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlist.setCreatedAt(LocalDateTime.now());

        wishlistRepository.save(wishlist);

        log.info("Product {} added to wishlist for user: {}", productId, user.getEmail());
    }

    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Product {} removed from wishlist for user: {}", productId, userId);
    }

    // Notification management
    public NotificationPreferencesResponse getNotificationPreferences(Long userId) {
        NotificationPreferences prefs = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return notificationMapper.toPreferencesResponse(prefs);
    }

    public NotificationPreferencesResponse updateNotificationPreferences(
            Long userId, NotificationPreferencesRequest request) {

        NotificationPreferences prefs = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        prefs.setEmailNotifications(request.isEmailNotifications());
        prefs.setSmsNotifications(request.isSmsNotifications());
        prefs.setPushNotifications(request.isPushNotifications());
        prefs.setOrderUpdates(request.isOrderUpdates());
        prefs.setPromotionalEmails(request.isPromotionalEmails());
        prefs.setNewsletter(request.isNewsletter());

        prefs = preferencesRepository.save(prefs);

        return notificationMapper.toPreferencesResponse(prefs);
    }

    public List<NotificationResponse> getNotifications(Long userId, boolean unreadOnly) {
        List<Notification> notifications;

        if (unreadOnly) {
            notifications = notificationRepository.findUnreadByUserId(userId);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public void markNotificationAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository
                .findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void markAllNotificationsAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // Recently viewed products
    public List<ProductResponse> getRecentlyViewedProducts(Long userId) {
        List<RecentlyViewed> recentlyViewed = recentlyViewedRepository
                .findByUserIdOrderByViewedAtDesc(userId);

        return recentlyViewed.stream()
                .map(item -> productMapper.toResponse(item.getProduct()))
                .limit(10)
                .collect(Collectors.toList());
    }

    public void addToRecentlyViewed(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        RecentlyViewed existing = recentlyViewedRepository
                .findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (existing != null) {
            existing.setViewedAt(LocalDateTime.now());
            recentlyViewedRepository.save(existing);
        } else {
            RecentlyViewed recentlyViewed = new RecentlyViewed();
            recentlyViewed.setUser(user);
            recentlyViewed.setProduct(product);
            recentlyViewed.setViewedAt(LocalDateTime.now());
            recentlyViewedRepository.save(recentlyViewed);
        }

        // Keep only last 20 items
        recentlyViewedRepository.keepOnlyRecent(userId, 20);
    }

    // Loyalty points
    public LoyaltyPointsResponse getLoyaltyPoints(Long userId) {
        LoyaltyPoints points = loyaltyPointsRepository.findByUserId(userId)
                .orElseGet(() -> createLoyaltyAccount(userId));

        return loyaltyMapper.toResponse(points);
    }

    public void addLoyaltyPoints(Long userId, int points, String description) {
        LoyaltyPoints account = loyaltyPointsRepository.findByUserId(userId)
                .orElseGet(() -> createLoyaltyAccount(userId));

        account.setTotalPoints(account.getTotalPoints() + points);
        account.setAvailablePoints(account.getAvailablePoints() + points);
        loyaltyPointsRepository.save(account);

        // Create transaction record
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setUser(userRepository.findById(userId).get());
        transaction.setPoints(points);
        transaction.setType("EARNED");
        transaction.setDescription(description);
        transaction.setCreatedAt(LocalDateTime.now());
        loyaltyTransactionRepository.save(transaction);

        log.info("Added {} loyalty points for user: {}", points, userId);
    }

    public RedemptionResponse redeemPoints(Long userId, RedeemPointsRequest request) {
        LoyaltyPoints account = loyaltyPointsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Loyalty account not found"));

        if (account.getAvailablePoints() < request.getPoints()) {
            throw new RuntimeException("Insufficient loyalty points");
        }

        account.setAvailablePoints(account.getAvailablePoints() - request.getPoints());
        account.setRedeemedPoints(account.getRedeemedPoints() + request.getPoints());
        loyaltyPointsRepository.save(account);

        // Create redemption record
        LoyaltyRedemption redemption = new LoyaltyRedemption();
        redemption.setUser(userRepository.findById(userId).get());
        redemption.setPoints(request.getPoints());
        redemption.setRewardType(request.getRewardType());
        redemption.setRewardValue(calculateRewardValue(request.getPoints()));
        redemption.setStatus("APPROVED");
        redemption.setCreatedAt(LocalDateTime.now());

        redemption = loyaltyRedemptionRepository.save(redemption);

        log.info("Redeemed {} points for user: {}", request.getPoints(), userId);

        return redemptionMapper.toResponse(redemption);
    }

    // Reviews
    public List<ReviewResponse> getUserReviews(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse createReview(Long userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if user has purchased this product
        if (!orderRepository.hasUserPurchasedProduct(userId, request.getProductId())) {
            throw new RuntimeException("You can only review products you have purchased");
        }

        // Check if already reviewed
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setVerifiedPurchase(true);
        review.setCreatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);

        // Update product rating
        updateProductRating(request.getProductId());

        log.info("Review created for product {} by user: {}",
                request.getProductId(), user.getEmail());

        return reviewMapper.toResponse(review);
    }

    // User statistics
    public UserStatisticsResponse getUserStatistics(Long userId) {
        UserStatisticsResponse stats = new UserStatisticsResponse();

        stats.setTotalOrders(orderRepository.countByUserId(userId));
        stats.setTotalSpent(orderRepository.getTotalSpentByUser(userId));
        stats.setTotalReviews(reviewRepository.countByUserId(userId));
        stats.setWishlistItems(wishlistRepository.countByUserId(userId));
        stats.setLoyaltyPoints(getLoyaltyPointsBalance(userId));
        stats.setMemberSince(userRepository.findById(userId)
                .map(User::getCreatedAt).orElse(null));

        return stats;
    }

    // Account deletion
    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Mark account for deletion (soft delete)
        user.setActive(false);
        user.setDeletionRequested(true);
        user.setDeletionRequestedAt(LocalDateTime.now());
        userRepository.save(user);

        // Send confirmation email
        Map<String, Object> variables = new HashMap<>();
        variables.put("userName", user.getFirstName());
        variables.put("deletionDate", LocalDateTime.now().plusDays(30));

        emailService.sendEmail(
                user.getEmail(),
                "Account Deletion Request",
                "account-deletion",
                variables);

        log.info("Account deletion requested for user: {}", user.getEmail());
    }

    // Data export (GDPR)
    public byte[] exportUserData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> userData = new HashMap<>();
        userData.put("profile", userMapper.toDetailResponse(user));
        userData.put("orders", orderRepository.findByUserId(userId));
        userData.put("addresses", addressRepository.findByUserId(userId));
        userData.put("reviews", reviewRepository.findByUserId(userId));
        userData.put("wishlist", wishlistRepository.findByUserId(userId));

        // Convert to JSON
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsBytes(userData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export user data", e);
        }
    }

    private NotificationPreferences createDefaultPreferences(Long userId) {
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.setUserId(userId);
        prefs.setEmailNotifications(true);
        prefs.setSmsNotifications(false);
        prefs.setPushNotifications(true);
        prefs.setOrderUpdates(true);
        prefs.setPromotionalEmails(true);
        prefs.setNewsletter(true);

        return preferencesRepository.save(prefs);
    }

    private LoyaltyPoints createLoyaltyAccount(Long userId) {
        LoyaltyPoints account = new LoyaltyPoints();
        account.setUserId(userId);
        account.setTotalPoints(0);
        account.setAvailablePoints(0);
        account.setRedeemedPoints(0);
        account.setTier("BRONZE");
        account.setCreatedAt(LocalDateTime.now());

        return loyaltyPointsRepository.save(account);
    }

    private int getLoyaltyPointsBalance(Long userId) {
        return loyaltyPointsRepository.findByUserId(userId)
                .map(LoyaltyPoints::getAvailablePoints)
                .orElse(0);
    }

    private BigDecimal calculateRewardValue(int points) {
        // 100 points = ₹10
        return BigDecimal.valueOf(points).divide(BigDecimal.valueOf(10));
    }

    private void updateProductRating(Long productId) {
        Double averageRating = reviewRepository.getAverageRating(productId);
        Integer totalReviews = reviewRepository.countByProductId(productId);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAverageRating(averageRating != null ? averageRating : 0.0);
            product.setTotalReviews(totalReviews);
            productRepository.save(product);
        }
    }
}