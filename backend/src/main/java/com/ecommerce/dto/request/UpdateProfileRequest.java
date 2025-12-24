package com.ecommerce.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String companyName; // For business users
    private String gstNumber; // For business users
}