package com.ecommerce.mapper;

import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { ProductMapper.class })
public interface CartMapper {

    @Mapping(target = "totalQuantity", expression = "java(cart.getItems().stream().mapToInt(com.ecommerce.entity.CartItem::getQuantity).sum())")
    CartResponse toResponse(Cart cart);

    @Mapping(target = "totalPrice", expression = "java(item.getCurrentPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))")
    CartItemResponse toItemResponse(CartItem item);
}