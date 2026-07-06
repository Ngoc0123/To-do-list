package com.example.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProjectRequest(
        @NotBlank(message = "Project name is required")
        @Size(max = 255, message = "Project name cannot exceed 255 characters")
        String name,

        @Size(max = 1000, message = "Project description cannot exceed 1000 characters")
        String description,

        @Size(max = 32, message = "Project color cannot exceed 32 characters")
        String color
) {
}
