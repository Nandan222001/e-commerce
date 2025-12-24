package com.ecommerce.dto.request;

import lombok.Data;

@Data
public class UserPreferencesRequest {
    private String currency;
    private String language;
    private String timezone;
}