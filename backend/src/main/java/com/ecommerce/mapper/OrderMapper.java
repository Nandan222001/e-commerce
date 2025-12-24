package com.ecommerce.mapper;

import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.UserResponse; // Import UserResponse
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.User; // Import User
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;

@Mapper(componentModel = "spring", uses = {UserMapper.class, AddressMapper.class, InvoiceMapper.class})
public interface OrderMapper {
    
    @Mapping(source = "paymentTransactionId", target = "paymentTransactionId")
    @Mapping(source = "invoice", target = "invoice")
    @Mapping(target = "user", qualifiedByName = "mapUserToUserResponse") // Resolve Ambiguity
    OrderResponse toResponse(Order order);
    
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.imageUrls", target = "productImageUrl", qualifiedByName = "firstImage")
    OrderItemResponse toItemResponse(OrderItem orderItem);
    
    @Named("firstImage")
    default String getFirstImage(Set<String> imageUrls) { // Changed List to Set
        return (imageUrls != null && !imageUrls.isEmpty()) ? imageUrls.iterator().next() : null;
    }

    // Add this to resolve ambiguity between UserMapper methods
    @Named("mapUserToUserResponse") 
    default UserResponse mapUserToUserResponse(User user) {
        if (user == null) return null;
        // Simple manual mapping or delegate to UserMapper if injected (requires abstract class instead of interface)
        // Since we are in interface, we can't easily delegate to injected UserMapper without abstract class.
        // Simplest fix: return null or partial object, OR ideally:
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .customerType(user.getCustomerType().toString())
            .roles(user.getRoles())
            .build();
    }
}