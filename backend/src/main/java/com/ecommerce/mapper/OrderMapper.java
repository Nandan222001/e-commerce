package com.ecommerce.mapper;

import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { UserMapper.class, AddressMapper.class, InvoiceMapper.class })
public interface OrderMapper {

    @Mapping(source = "paymentTransactionId", target = "paymentTransactionId")
    @Mapping(source = "invoice", target = "invoice")
    OrderResponse toResponse(Order order);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.imageUrls", target = "productImageUrl", qualifiedByName = "firstImage")
    OrderItemResponse toItemResponse(OrderItem orderItem);

    @org.mapstruct.Named("firstImage")
    default String getFirstImage(java.util.List<String> imageUrls) {
        return (imageUrls != null && !imageUrls.isEmpty()) ? imageUrls.get(0) : null;
    }
}