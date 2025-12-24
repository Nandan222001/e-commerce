package com.ecommerce.utils;

import java.util.regex.Pattern;

public class ValidationUtils {

    private static final String GST_REGEX = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$";
    private static final String PHONE_REGEX = "^[6-9]\\d{9}$";
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

    public static boolean isValidGstNumber(String gstNumber) {
        if (gstNumber == null)
            return false;
        return Pattern.matches(GST_REGEX, gstNumber);
    }

    public static boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null)
            return false;
        return Pattern.matches(PHONE_REGEX, phoneNumber);
    }

    public static boolean isValidEmail(String email) {
        if (email == null)
            return false;
        return Pattern.matches(EMAIL_REGEX, email);
    }
}