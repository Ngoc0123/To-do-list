package com.example.todo.dto;

import com.example.todo.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

public record UpdateTaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title cannot exceed 255 characters")
        String title,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        UUID projectId,

        TaskPriority priority,

        LocalDateTime dueDate,

        boolean isCompleted
) {
}
