package com.ecommerce.service;

import org.springframework.stereotype.Service;

@Service
public class LoyaltyService {
    public void addPoints(Long userId, int points, String description) {}
    public void deductPoints(Long userId, int points, String description) {}
}