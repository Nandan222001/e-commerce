// src/main/java/com/ecommerce/service/AddressService.java
package com.ecommerce.service;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.AddressMapper;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Transactional(readOnly = false)
    public List<AddressResponse> getUserAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return addresses.stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Address address = addressMapper.toEntity(request);
        address.setUser(user);
        address.setCreatedAt(LocalDateTime.now());
        
        if (request.isDefault()) {
            // Unset other default addresses
            unsetOtherDefaults(userId);
        }
        
        address = addressRepository.save(address);
        log.info("Address added for user: {}", userId);
        return addressMapper.toResponse(address);
    }

    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to address");
        }
        
        addressMapper.updateEntity(request, address);
        
        if (request.isDefault()) {
            unsetOtherDefaults(userId);
        }
        
        address.setUpdatedAt(LocalDateTime.now());
        address = addressRepository.save(address);
        log.info("Address updated: {}", addressId);
        return addressMapper.toResponse(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to address");
        }
        
        addressRepository.delete(address);
        log.info("Address deleted: {}", addressId);
    }

    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to address");
        }
        
        unsetOtherDefaults(userId);
        address.setDefault(true);
        address = addressRepository.save(address);
        
        return addressMapper.toResponse(address);
    }

    private void unsetOtherDefaults(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}