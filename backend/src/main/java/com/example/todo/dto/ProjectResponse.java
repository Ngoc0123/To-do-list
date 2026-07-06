package com.example.todo.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String name,
        String description,
        String color,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
