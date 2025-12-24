package com.ecommerce.mapper;

import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "parent.name", target = "parentName")
    @Mapping(target = "productCount", expression = "java(category.getProducts() != null ? category.getProducts().size() : 0)")
    @Mapping(target = "subCategories", ignore = true) // Set manually for tree structure to avoid infinite recursion
    CategoryResponse toResponse(Category category);
}