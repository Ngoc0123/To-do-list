package com.example.todo.controller;

import com.example.todo.dto.CreateTaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.dto.UpdateTaskRequest;
import com.example.todo.service.TaskService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/v1/tasks")
@Validated
public class TaskController {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final String DEFAULT_SORT = "dueDate,asc";
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("dueDate", "createdAt", "title", "priority");

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(required = false) String dateFilter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDateTo,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page index cannot be negative") int page,
            @RequestParam(defaultValue = "" + DEFAULT_PAGE_SIZE) @Min(value = 1, message = "Page size must be at least 1") @Max(value = 50, message = "Page size cannot exceed 50") int size,
            @RequestParam(defaultValue = DEFAULT_SORT) String sort) {
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return ResponseEntity.ok(taskService.getTasks(search, isCompleted, dateFilter, dueDateFrom, dueDateTo, projectId, pageable));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        return new ResponseEntity<>(taskService.createTask(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggleTaskStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.toggleTask(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    private Sort parseSort(String sort) {
        String[] sortParams = sort.split(",", 2);
        if (!ALLOWED_SORT_FIELDS.contains(sortParams[0])) {
            throw new IllegalArgumentException("Unsupported sort field: " + sortParams[0]);
        }

        if (sortParams.length > 1
                && !"asc".equalsIgnoreCase(sortParams[1])
                && !"desc".equalsIgnoreCase(sortParams[1])) {
            throw new IllegalArgumentException("Unsupported sort direction: " + sortParams[1]);
        }

        Sort sortOrder = Sort.by(sortParams[0]);
        return sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? sortOrder.descending()
                : sortOrder.ascending();
    }
}
