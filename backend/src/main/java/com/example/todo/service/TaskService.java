package com.example.todo.service;

import com.example.todo.dto.CreateTaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.dto.UpdateTaskRequest;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    Page<TaskResponse> getTasks(
            String search,
            Boolean isCompleted,
            String dateFilter,
            LocalDateTime dueDateFrom,
            LocalDateTime dueDateTo,
            UUID projectId,
            Pageable pageable);

    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse updateTask(UUID id, UpdateTaskRequest request);

    TaskResponse toggleTask(UUID id);

    void deleteTask(UUID id);
}
