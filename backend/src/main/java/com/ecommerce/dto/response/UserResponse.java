package com.ecommerce.dto.response;

import com.ecommerce.entity.Role;
import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String customerType;
    private String companyName;
    private String gstNumber;
    private String phoneNumber;
    private Set<Role> roles;
    private Boolean emailVerified;
    private String avatarUrl;
    private Boolean active;
}