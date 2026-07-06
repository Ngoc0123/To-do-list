package com.example.todo.service;

import com.example.todo.dto.TaskResponse;
import com.example.todo.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {
    private final ProjectMapper projectMapper;

    public TaskMapper(ProjectMapper projectMapper) {
        this.projectMapper = projectMapper;
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                projectMapper.toResponse(task.getProject()),
                task.getPriority(),
                task.getDueDate(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
