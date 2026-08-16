package com.medibridge.core.exception;

import com.medibridge.core.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler to catch and format all exceptions thrown by the application.
 * This prevents raw stack traces from reaching the client and provides a consistent response structure.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles specific ResourceNotFoundException.
     * Maps to HTTP 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ApiResponse response = new ApiResponse(ex.getMessage(), false);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles validation errors when DTO inputs fail @Valid checks.
     * Maps to HTTP 400 Bad Request and returns a map of field-specific errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        
        // Extract field names and their corresponding error messages
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            validationErrors.put(fieldName, message);
        });

        ApiResponse response = new ApiResponse("Validation failed", false, validationErrors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Spring Security Access Denied exceptions.
     * Maps to HTTP 403 Forbidden.
     */
    @ExceptionHandler({org.springframework.security.access.AccessDeniedException.class, org.springframework.security.authorization.AuthorizationDeniedException.class})
    public ResponseEntity<ApiResponse> handleAccessDeniedException(Exception ex) {
        ApiResponse response = new ApiResponse("Access denied: " + ex.getMessage(), false);
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Generic catch-all for any other unhandled exceptions.
     * Maps to HTTP 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGlobalException(Exception ex) {
        // In a real production app, we'd log the full exception stack trace here securely
        ApiResponse response = new ApiResponse("An unexpected error occurred: " + ex.getMessage(), false);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
