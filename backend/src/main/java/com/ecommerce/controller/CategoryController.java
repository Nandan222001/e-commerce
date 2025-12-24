// src/main/java/com/ecommerce/controller/CategoryController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Categories", description = "Category management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Get list of all categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        log.info("Fetching all categories");

        List<CategoryResponse> categories = categoryService.getAllCategories();

        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get category details by ID")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        log.info("Fetching category with ID: {}", id);

        CategoryResponse category = categoryService.getCategoryById(id);

        return ResponseEntity.ok(category);
    }

    @GetMapping("/tree")
    @Operation(summary = "Get category tree", description = "Get hierarchical category structure")
    public ResponseEntity<List<CategoryResponse>> getCategoryTree() {
        log.info("Fetching category tree");

        List<CategoryResponse> categoryTree = categoryService.getCategoryTree();

        return ResponseEntity.ok(categoryTree);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create category", description = "Create a new category")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Creating category by admin: {}", admin.getEmail());

        CategoryResponse category = categoryService.createCategory(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update category", description = "Update existing category")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Updating category {} by admin: {}", id, admin.getEmail());

        CategoryResponse category = categoryService.updateCategory(id, request);

        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category", description = "Delete a category")
    public ResponseEntity<Map<String, String>> deleteCategory(
            @PathVariable Long id,
            Authentication authentication) {

        User admin = (User) authentication.getPrincipal();
        log.info("Deleting category {} by admin: {}", id, admin.getEmail());

        categoryService.deleteCategory(id);

        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}