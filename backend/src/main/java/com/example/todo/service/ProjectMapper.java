package com.example.todo.service;

import com.example.todo.dto.ProjectResponse;
import com.example.todo.entity.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {
    public ProjectResponse toResponse(Project project) {
        if (project == null) {
            return null;
        }

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getColor(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
