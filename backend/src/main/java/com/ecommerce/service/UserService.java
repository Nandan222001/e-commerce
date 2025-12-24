package com.ecommerce.service;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.*;
import com.ecommerce.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper; // Added for data export
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    // --- Repositories ---
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WishlistRepository wishlistRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationPreferencesRepository preferencesRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final ProductRepository productRepository; // Added missing
    private final OrderRepository orderRepository; // Added missing
    private final AddressRepository addressRepository; // Added missing
    private final LoyaltyTransactionRepository loyaltyTransactionRepository; // Added missing
    private final LoyaltyRedemptionRepository loyaltyRedemptionRepository; // Added missing

    // --- Mappers ---
    private final UserMapper userMapper;
    private final ProductMapper productMapper; // Added missing
    private final NotificationMapper notificationMapper; // Added missing
    private final LoyaltyMapper loyaltyMapper; // Added missing
    private final ReviewMapper reviewMapper; // Added missing

    // --- Services ---
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ObjectMapper objectMapper; // Injected for JSON operations

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

        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteFile(user.getAvatarUrl());
        }

        String avatarUrl = fileStorageService.uploadFile(file, "avatars/" + userId);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String search, String role, String customerType, Pageable pageable) {
        Page<User> users;
        if (search != null && !search.isEmpty()) {
            users = userRepository.searchUsers(search, pageable);
        } else if (role != null && !role.isEmpty()) {
            users = userRepository.findByRole(role, pageable);
        } else if (customerType != null && !customerType.isEmpty()) {
            users = userRepository.findByCustomerType(User.CustomerType.valueOf(customerType), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(userMapper::toResponse);
    }

    public UserDetailResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetailResponse response = userMapper.toDetailResponse(user);
        response.setTotalOrders(userRepository.countUserOrders(userId));
        response.setTotalSpent(userRepository.getTotalSpent(userId));
        response.setLoyaltyPoints(getLoyaltyPointsBalance(userId));
        return response;
    }

    // --- Wishlist management ---
    public List<ProductResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(item -> productMapper.toResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    public void addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlist.setCreatedAt(LocalDateTime.now());
        wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    // --- Loyalty Points ---
    public void addLoyaltyPoints(Long userId, int points, String description) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LoyaltyPoints account = loyaltyPointsRepository.findByUserId(userId)
                .orElseGet(() -> createLoyaltyAccount(userId));

        account.setTotalPoints(account.getTotalPoints() + points);
        account.setAvailablePoints(account.getAvailablePoints() + points);
        loyaltyPointsRepository.save(account);

        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setUser(user);
        transaction.setPoints(points);
        transaction.setType("EARNED");
        transaction.setDescription(description);
        transaction.setCreatedAt(LocalDateTime.now());
        loyaltyTransactionRepository.save(transaction);
    }

    // --- Data Export (GDPR) ---
    public byte[] exportUserData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("profile", userMapper.toDetailResponse(user));
        userData.put("orders", orderRepository.findByUserId(userId));
        userData.put("addresses", addressRepository.findByUserId(userId));
        userData.put("reviews", reviewRepository.findByUserId(userId));
        userData.put("wishlist", wishlistRepository.findByUserId(userId));

        try {
            return objectMapper.writeValueAsBytes(userData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export user data", e);
        }
    }

    // --- Private Helper Methods ---
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

    private void updateProductRating(Long productId) {
        Double averageRating = reviewRepository.getAverageRating(productId);
        Integer totalReviews = reviewRepository.countByProductId(productId);

        productRepository.findById(productId).ifPresent(product -> {
            product.setAverageRating(averageRating != null ? averageRating : 0.0);
            product.setTotalReviews(totalReviews != null ? totalReviews : 0);
            productRepository.save(product);
        });
    }
    
    // ... Other methods (toggleUserStatus, getNotifications, etc.) remain largely the same 
    // but ensure they use the newly injected mappers and repositories.
}