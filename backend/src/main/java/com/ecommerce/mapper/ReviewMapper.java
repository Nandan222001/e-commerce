package com.ecommerce.mapper;

import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named; // Import Named

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.imageUrls", target = "productImageUrl", qualifiedByName = "firstImage")
    @Mapping(source = "user.firstName", target = "userName")
    @Mapping(source = "user.avatarUrl", target = "userAvatar")
    ReviewResponse toResponse(Review review);
    
    @Named("firstImage")
    default String getFirstImage(Set<String> imageUrls) { // Changed List to Set to match Entity
        return (imageUrls != null && !imageUrls.isEmpty()) ? imageUrls.iterator().next() : null;
    }
}