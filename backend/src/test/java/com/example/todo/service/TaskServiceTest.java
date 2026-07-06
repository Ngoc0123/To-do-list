package com.example.todo.service;

import com.example.todo.dto.CreateTaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.entity.Project;
import com.example.todo.entity.Task;
import com.example.todo.entity.TaskPriority;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.repository.ProjectRepository;
import com.example.todo.repository.TaskRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

class TaskServiceTest {
    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    private TaskMapper taskMapper;

    private TaskServiceImpl taskService;

    private Validator validator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        taskMapper = new TaskMapper(new ProjectMapper());
        taskService = new TaskServiceImpl(taskRepository, projectRepository, taskMapper);
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void whenCreateTaskWithValidRequestShouldReturnTaskResponse() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder()
                .id(projectId)
                .name("Backend")
                .description("Backend API work")
                .color("#2563eb")
                .build();
        LocalDateTime dueDate = LocalDateTime.now().plusDays(1);
        CreateTaskRequest req = new CreateTaskRequest("Learn Spring Boot", "Read IoC documentation", projectId, TaskPriority.HIGH, dueDate);
        Task savedTask = Task.builder()
                .id(UUID.randomUUID())
                .title(req.title())
                .description(req.description())
                .project(project)
                .priority(req.priority())
                .dueDate(req.dueDate())
                .isCompleted(false)
                .build();

        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        Mockito.when(taskRepository.save(ArgumentMatchers.any(Task.class))).thenReturn(savedTask);

        TaskResponse res = taskService.createTask(req);

        Assertions.assertNotNull(res);
        Assertions.assertEquals("Learn Spring Boot", res.title());
        Assertions.assertNotNull(res.project());
        Assertions.assertEquals(projectId, res.project().id());
        Assertions.assertEquals("Backend", res.project().name());
        Assertions.assertEquals("Backend API work", res.project().description());
        Assertions.assertEquals("#2563eb", res.project().color());
        Assertions.assertEquals(TaskPriority.HIGH, res.priority());
        Assertions.assertEquals(dueDate, res.dueDate());
        Mockito.verify(projectRepository, Mockito.times(1)).findById(projectId);
        Mockito.verify(taskRepository, Mockito.times(1)).save(ArgumentMatchers.any(Task.class));
    }

    @Test
    void whenCreateTaskWithoutPriorityShouldDefaultToMediumPriority() {
        CreateTaskRequest req = new CreateTaskRequest("Learn Spring Boot", null, null, null, null);
        Task savedTask = Task.builder()
                .id(UUID.randomUUID())
                .title(req.title())
                .priority(TaskPriority.MEDIUM)
                .isCompleted(false)
                .build();

        Mockito.when(taskRepository.save(ArgumentMatchers.any(Task.class))).thenReturn(savedTask);

        TaskResponse res = taskService.createTask(req);

        Assertions.assertEquals(TaskPriority.MEDIUM, res.priority());
    }

    @Test
    void whenCreateTaskShouldTrimTitleAndBlankDescriptionShouldBecomeNull() {
        CreateTaskRequest req = new CreateTaskRequest("  Learn Spring Boot  ", "   ", null, TaskPriority.LOW, null);

        Mockito.when(taskRepository.save(ArgumentMatchers.any(Task.class)))
                .thenAnswer(invocation -> {
                    Task task = invocation.getArgument(0);
                    task.setId(UUID.randomUUID());
                    return task;
                });

        TaskResponse res = taskService.createTask(req);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        Mockito.verify(taskRepository).save(taskCaptor.capture());
        Task savedTask = taskCaptor.getValue();
        Assertions.assertEquals("Learn Spring Boot", savedTask.getTitle());
        Assertions.assertNull(savedTask.getDescription());
        Assertions.assertEquals("Learn Spring Boot", res.title());
        Assertions.assertNull(res.description());
    }

    @Test
    void whenCreateTaskWithoutProjectShouldNotLookUpProject() {
        CreateTaskRequest req = new CreateTaskRequest("Standalone task", null, null, TaskPriority.MEDIUM, null);
        Task savedTask = Task.builder()
                .id(UUID.randomUUID())
                .title(req.title())
                .priority(TaskPriority.MEDIUM)
                .isCompleted(false)
                .build();

        Mockito.when(taskRepository.save(ArgumentMatchers.any(Task.class))).thenReturn(savedTask);

        TaskResponse res = taskService.createTask(req);

        Assertions.assertNull(res.project());
        Mockito.verify(projectRepository, Mockito.never()).findById(ArgumentMatchers.any(UUID.class));
        Mockito.verify(taskRepository, Mockito.times(1)).save(ArgumentMatchers.any(Task.class));
    }

    @Test
    void whenCreateTaskWithBlankTitleShouldFailValidation() {
        CreateTaskRequest emptyTitle = new CreateTaskRequest("", null, null, TaskPriority.MEDIUM, null);
        CreateTaskRequest spacesOnlyTitle = new CreateTaskRequest("   ", null, null, TaskPriority.MEDIUM, null);

        Set<ConstraintViolation<CreateTaskRequest>> emptyViolations = validator.validate(emptyTitle);
        Set<ConstraintViolation<CreateTaskRequest>> spacesOnlyViolations = validator.validate(spacesOnlyTitle);

        Assertions.assertTrue(hasTitleRequiredViolation(emptyViolations));
        Assertions.assertTrue(hasTitleRequiredViolation(spacesOnlyViolations));
    }

    @Test
    void whenCreateTaskWithInvalidProjectIdShouldThrowResourceNotFoundException() {
        UUID invalidProjectId = UUID.randomUUID();
        CreateTaskRequest req = new CreateTaskRequest("Learn Spring Boot", null, invalidProjectId, TaskPriority.MEDIUM, null);
        Mockito.when(projectRepository.findById(invalidProjectId)).thenReturn(Optional.empty());

        Assertions.assertThrows(ResourceNotFoundException.class, () -> taskService.createTask(req));
        Mockito.verify(projectRepository, Mockito.times(1)).findById(invalidProjectId);
        Mockito.verify(taskRepository, Mockito.times(0)).save(ArgumentMatchers.any(Task.class));
    }

    @Test
    void whenToggleTaskWithInvalidIdShouldThrowResourceNotFoundException() {
        UUID invalidId = UUID.randomUUID();
        Mockito.when(taskRepository.findById(invalidId)).thenReturn(Optional.empty());

        Assertions.assertThrows(ResourceNotFoundException.class, () -> taskService.toggleTask(invalidId));
        Mockito.verify(taskRepository, Mockito.times(1)).findById(invalidId);
    }

    private boolean hasTitleRequiredViolation(Set<ConstraintViolation<CreateTaskRequest>> violations) {
        return violations.stream()
                .anyMatch(violation -> "title".equals(violation.getPropertyPath().toString())
                        && "Title is required".equals(violation.getMessage()));
    }
}
