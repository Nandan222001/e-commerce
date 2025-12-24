package com.ecommerce.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CartValidationResponse {
    private boolean valid;
    private List<String> messages;
    private CartResponse cart;
}