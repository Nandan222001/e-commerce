package com.ecommerce.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private String parentName;
    private String imageUrl;
    private Integer productCount;
    private List<CategoryResponse> subCategories;
}