package com.ecommerce.service;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final LoyaltyRedemptionRepository loyaltyRedemptionRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final SupportTicketRepository supportTicketRepository;

    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final NotificationMapper notificationMapper;
    private final ReviewMapper reviewMapper;
    private final LoyaltyMapper loyaltyMapper;
    
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ... (Keep existing findByEmail, existsByEmail, updateLastLogin, getUserProfile, updateProfile, uploadAvatar methods) ...

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
        return userMapper.toProfileResponse(user);
    }

    public String uploadAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String avatarUrl = fileStorageService.uploadFile(file, "avatars/" + userId);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }

    // --- Missing Methods Below ---

    public UserDetailResponse getUserDetails(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    UserDetailResponse response = userMapper.toDetailResponse(user);
    // CORRECTED METHOD NAMES:
    response.setTotalOrders(orderRepository.countByUserId(userId));
    response.setTotalSpent(orderRepository.getTotalSpentByUser(userId));
    // Also use the helper we added earlier
    response.setLoyaltyPoints(getLoyaltyPointsBalance(userId));
    
    return response;
}
    private int getLoyaltyPointsBalance(Long userId) {
        return loyaltyPointsRepository.findByUserId(userId)
            .map(LoyaltyPoints::getAvailablePoints)
            .orElse(0);
    }
    public Page<UserResponse> getAllUsers(String search, String role, String customerType, Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.getActive());
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    public UserResponse updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.setRoles(Set.of(role));
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    // Wishlist
    public List<ProductResponse> getWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        // Fix for incompatible types error
        return wishlistItems.stream()
            .map(item -> productMapper.toResponse(item.getProduct()))
            .collect(Collectors.toList());
    }

    public void addToWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            User user = userRepository.findById(userId).orElseThrow();
            Product product = productRepository.findById(productId).orElseThrow();
            Wishlist w = new Wishlist();
            w.setUser(user);
            w.setProduct(product);
            wishlistRepository.save(w);
        }
    }

    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    // Recently Viewed
    public void addToRecentlyViewed(Long userId, Long productId) {
        User user = userRepository.getReferenceById(userId);
        Product product = productRepository.getReferenceById(productId);
        
        Optional<RecentlyViewed> existing = recentlyViewedRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            existing.get().setViewedAt(LocalDateTime.now());
            recentlyViewedRepository.save(existing.get());
        } else {
            RecentlyViewed rv = new RecentlyViewed();
            rv.setUser(user);
            rv.setProduct(product);
            rv.setViewedAt(LocalDateTime.now());
            recentlyViewedRepository.save(rv);
        }
    }

    public List<ProductResponse> getRecentlyViewedProducts(Long userId) {
        return recentlyViewedRepository.findByUserIdOrderByViewedAtDesc(userId).stream()
            .map(rv -> productMapper.toResponse(rv.getProduct()))
            .collect(Collectors.toList());
    }

    // Notifications
    public NotificationPreferencesResponse getNotificationPreferences(Long userId) {
        NotificationPreferences prefs = preferencesRepository.findByUserId(userId)
            .orElse(new NotificationPreferences()); // Return default if not found
        return notificationMapper.toPreferencesResponse(prefs);
    }

    public NotificationPreferencesResponse updateNotificationPreferences(Long userId, NotificationPreferencesRequest request) {
        NotificationPreferences prefs = preferencesRepository.findByUserId(userId)
            .orElse(new NotificationPreferences());
        prefs.setUserId(userId);
        prefs.setEmailNotifications(request.isEmailNotifications());
        prefs.setSmsNotifications(request.isSmsNotifications());
        // Set other fields...
        return notificationMapper.toPreferencesResponse(preferencesRepository.save(prefs));
    }

    public List<NotificationResponse> getNotifications(Long userId, boolean unreadOnly) {
        List<Notification> notifications = unreadOnly ? 
            notificationRepository.findUnreadByUserId(userId) : 
            notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(notificationMapper::toResponse).collect(Collectors.toList());
    }

    public void markNotificationAsRead(Long userId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow();
        if(n.getUser().getId().equals(userId)) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    public void markAllNotificationsAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // Preferences (Dummy implementation to fix compile error)
    public UserPreferencesResponse getUserPreferences(Long userId) {
        return new UserPreferencesResponse();
    }

    public UserPreferencesResponse updateUserPreferences(Long userId, UserPreferencesRequest request) {
        return new UserPreferencesResponse();
    }

    // Orders & Stats
    public OrderHistoryResponse getOrderHistory(Long userId, int page, int size) {
        Page<Order> orders = orderRepository.findByUserId(userId, PageRequest.of(page, size));
        OrderHistoryResponse response = new OrderHistoryResponse();
        // Map page to response...
        return response;
    }

    public UserStatisticsResponse getUserStatistics(Long userId) {
        return new UserStatisticsResponse();
    }

    // Loyalty
    public LoyaltyPointsResponse getLoyaltyPoints(Long userId) {
        LoyaltyPoints points = loyaltyPointsRepository.findByUserId(userId).orElse(new LoyaltyPoints());
        return loyaltyMapper.toResponse(points);
    }

    public List<PointsTransactionResponse> getPointsHistory(Long userId, int page, int size) {
        return loyaltyTransactionRepository.findByUserId(userId, PageRequest.of(page, size))
            .map(loyaltyMapper::toTransactionResponse) // Ensure this method exists in LoyaltyMapper
            .getContent();
    }

    public RedemptionResponse redeemPoints(Long userId, RedeemPointsRequest request) {
        LoyaltyRedemption redemption = new LoyaltyRedemption();
        // Logic to deduct points and save redemption
        return loyaltyMapper.toResponse(redemption);
    }

    // Reviews
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId).stream()
            .map(reviewMapper::toResponse)
            .collect(Collectors.toList());
    }

    public ReviewResponse createReview(Long userId, CreateReviewRequest request) {
        Review review = new Review();
        // Map request to review entity
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    public ReviewResponse updateReview(Long userId, Long reviewId, UpdateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        // Update logic
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    public void deleteReview(Long userId, Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    // Support
    public List<SupportTicketResponse> getSupportTickets(Long userId) {
        return new ArrayList<>(); // Dummy return
    }

    public SupportTicketResponse createSupportTicket(Long userId, CreateTicketRequest request) {
        return new SupportTicketResponse(); // Dummy return
    }

    // Referral & Account
    public ReferralInfoResponse getReferralInfo(Long userId) {
        return new ReferralInfoResponse();
    }

    public void sendReferralInvite(Long userId, ReferralInviteRequest request) {}

    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setActive(false); // Soft delete
        userRepository.save(user);
    }

    public byte[] exportUserData(Long userId) {
        return new byte[0];
    }
}