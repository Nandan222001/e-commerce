package com.ecommerce.dto.response;

import lombok.Data;

@Data
public class AddressResponse {
    private Long id;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String type;
    private boolean isDefault;
}