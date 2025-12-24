package com.ecommerce.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse extends UserResponse {

    private Object defaultShippingAddress;
    private Object defaultBillingAddress;
    private Object preferences;
}
