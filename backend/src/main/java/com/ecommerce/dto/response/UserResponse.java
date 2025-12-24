package com.ecommerce.dto.response;

import com.ecommerce.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
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
