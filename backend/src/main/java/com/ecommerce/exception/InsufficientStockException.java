package com.ecommerce.exception;

// InsufficientStockException.java
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }
}