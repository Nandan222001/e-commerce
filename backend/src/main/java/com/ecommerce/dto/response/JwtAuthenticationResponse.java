package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtAuthenticationResponse {
    private String token;
    private String refreshToken;
    private String tokenType;
    private UserResponse user;
}