package com.ecommerce.dto.response;

import lombok.Data;

@Data
public class UserPreferencesResponse {
    private String currency;
    private String language;
    private String timezone;
}