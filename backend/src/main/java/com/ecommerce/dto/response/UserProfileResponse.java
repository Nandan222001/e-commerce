package com.ecommerce.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserProfileResponse extends UserResponse {
    private AddressResponse defaultShippingAddress;
    private AddressResponse defaultBillingAddress;
    private UserPreferencesResponse preferences;
}