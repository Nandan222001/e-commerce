package com.ecommerce.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String title;
    private String comment;
    private boolean verifiedPurchase;
    private LocalDateTime createdAt;
    private Integer helpfulVotes;
}