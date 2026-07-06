package com.example.todo.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        int status,
        String error,
        String message,
        Map<String, String> details,
        LocalDateTime timestamp
) {
}
