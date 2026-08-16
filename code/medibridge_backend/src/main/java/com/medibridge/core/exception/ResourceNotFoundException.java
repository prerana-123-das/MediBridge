package com.medibridge.core.exception;

/**
 * Custom exception thrown when a requested resource (like a Patient or Doctor) is not found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
