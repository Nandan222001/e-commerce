package com.ecommerce.utils;

public class AppConstants {

    // Pagination defaults
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";

    // Roles
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";
    public static final String ROLE_FINANCE = "ROLE_FINANCE";

    // GST Configuration
    public static final double STANDARD_GST_RATE = 18.0;
    public static final String HOME_STATE_CODE = "27"; // Example: Maharashtra (Change based on company location)

    // File Storage
    public static final String UPLOAD_DIR = "uploads";
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    public static final String[] ALLOWED_IMAGE_EXTENSIONS = { "jpg", "jpeg", "png", "webp" };

    // Error Messages
    public static final String ERROR_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String ERROR_UNAUTHORIZED = "Unauthorized access";

    private AppConstants() {
        // Private constructor to prevent instantiation
    }
}