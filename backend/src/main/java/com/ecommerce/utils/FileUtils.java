package com.ecommerce.utils;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.UUID;

public class FileUtils {

    public static String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    public static boolean isImageFile(MultipartFile file) {
        String extension = getFileExtension(file.getOriginalFilename());
        return Arrays.asList(AppConstants.ALLOWED_IMAGE_EXTENSIONS).contains(extension);
    }

    public static String generateUniqueFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + "." + extension;
    }

    public static String sanitizeFileName(String filename) {
        return StringUtils.cleanPath(filename);
    }
}