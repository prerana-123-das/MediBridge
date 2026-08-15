package com.medibridge.core.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Standard API Response wrapper used across the entire application.
 * Ensures that frontend clients always receive a consistent JSON structure.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {

    private LocalDateTime timestamp;
    private String message;
    private boolean success;
    private Object data;

    // Convenience constructor for simple success/error messages without payload
    public ApiResponse(String message, boolean success) {
        this.timestamp = LocalDateTime.now();
        this.message = message;
        this.success = success;
    }

    // Convenience constructor for responses with data payload
    public ApiResponse(String message, boolean success, Object data) {
        this.timestamp = LocalDateTime.now();
        this.message = message;
        this.success = success;
        this.data = data;
    }
}
