package com.ecommerce.mapper;

import com.ecommerce.dto.request.ProductCreateRequest;
import com.ecommerce.dto.request.ProductUpdateRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(target = "price", ignore = true) // Calculated in service
    @Mapping(target = "inStock", expression = "java(product.getStockQuantity() > 0)")
    @Mapping(target = "lowStock", expression = "java(product.getStockQuantity() <= product.getMinStockLevel())")
    @Mapping(target = "isNew", ignore = true) // Calculated
    @Mapping(target = "isBestSeller", ignore = true) // Calculated
    @Mapping(target = "originalPrice", ignore = true)
    @Mapping(target = "discount", ignore = true)
    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true) // Set in service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "viewCount", constant = "0L")
    @Mapping(target = "totalReviews", constant = "0")
    @Mapping(target = "averageRating", constant = "0.0")
    @Mapping(target = "imageUrls", ignore = true)
    Product toEntity(ProductCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true) // Set in service if changed
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "imageUrls", ignore = true)
    void updateEntity(ProductUpdateRequest request, @MappingTarget Product product);
}