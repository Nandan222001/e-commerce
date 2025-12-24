package com.ecommerce.exception;

// InvalidTokenException.java
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}