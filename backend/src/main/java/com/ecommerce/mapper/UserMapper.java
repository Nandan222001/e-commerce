package com.ecommerce.mapper;

import com.ecommerce.dto.response.UserDetailResponse;
import com.ecommerce.dto.response.UserProfileResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AddressMapper.class, NotificationMapper.class})
public interface UserMapper {
    
    UserResponse toResponse(User user);
    
    @Mapping(target = "totalOrders", ignore = true)
    @Mapping(target = "totalSpent", ignore = true)
    @Mapping(target = "loyaltyPoints", ignore = true)
    @Mapping(target = "memberSince", expression = "java(user.getCreatedAt() != null ? user.getCreatedAt() : null)")
    @Mapping(target = "lastLogin", expression = "java(user.getLastLoginAt() != null ? user.getLastLoginAt() : null)")
    UserDetailResponse toDetailResponse(User user);
    
    @Mapping(target = "defaultShippingAddress", ignore = true)
    @Mapping(target = "defaultBillingAddress", ignore = true)
    @Mapping(target = "preferences", ignore = true)
    UserProfileResponse toProfileResponse(User user);
}