package com.example.todo.dto;

import com.example.todo.entity.TaskPriority;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        ProjectResponse project,
        TaskPriority priority,
        LocalDateTime dueDate,
        boolean isCompleted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
