package com.ecommerce.mapper;

import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.imageUrls", target = "productImageUrl", qualifiedByName = "firstImage")
    @Mapping(source = "user.firstName", target = "userName") // Simplified, logic can be complex
    @Mapping(source = "user.avatarUrl", target = "userAvatar")
    ReviewResponse toResponse(Review review);

    @org.mapstruct.Named("firstImage")
    default String getFirstImage(java.util.List<String> imageUrls) {
        return (imageUrls != null && !imageUrls.isEmpty()) ? imageUrls.get(0) : null;
    }
}