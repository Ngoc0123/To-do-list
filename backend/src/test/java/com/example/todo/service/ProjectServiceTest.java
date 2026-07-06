package com.example.todo.service;

import com.example.todo.dto.CreateProjectRequest;
import com.example.todo.dto.ProjectResponse;
import com.example.todo.dto.UpdateProjectRequest;
import com.example.todo.entity.Project;
import com.example.todo.repository.ProjectRepository;
import com.example.todo.repository.TaskRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
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

class ProjectServiceTest {
    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    private ProjectServiceImpl projectService;

    private Validator validator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        projectService = new ProjectServiceImpl(projectRepository, taskRepository, new ProjectMapper());
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void whenDeleteProjectShouldDeleteAssignedTasksBeforeDeletingProject() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder()
                .id(projectId)
                .name("Website")
                .build();

        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        projectService.deleteProject(projectId);

        Mockito.verify(taskRepository, Mockito.times(1)).deleteByProjectId(projectId);
        Mockito.verify(projectRepository, Mockito.times(1)).delete(project);
    }

    @Test
    void whenCreateProjectShouldTrimNameDescriptionAndColor() {
        CreateProjectRequest req = new CreateProjectRequest("  Website  ", "  Redesign pages  ", "  #2563eb  ");

        Mockito.when(projectRepository.existsByNameIgnoreCase("Website")).thenReturn(false);
        Mockito.when(projectRepository.save(ArgumentMatchers.any(Project.class)))
                .thenAnswer(invocation -> {
                    Project project = invocation.getArgument(0);
                    project.setId(UUID.randomUUID());
                    return project;
                });

        ProjectResponse res = projectService.createProject(req);

        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        Mockito.verify(projectRepository).save(projectCaptor.capture());
        Project savedProject = projectCaptor.getValue();
        Assertions.assertEquals("Website", savedProject.getName());
        Assertions.assertEquals("Redesign pages", savedProject.getDescription());
        Assertions.assertEquals("#2563eb", savedProject.getColor());
        Assertions.assertEquals("Website", res.name());
        Assertions.assertEquals("Redesign pages", res.description());
        Assertions.assertEquals("#2563eb", res.color());
    }

    @Test
    void whenCreateProjectWithBlankOptionalFieldsShouldStoreNulls() {
        CreateProjectRequest req = new CreateProjectRequest("Inbox", "   ", "");

        Mockito.when(projectRepository.existsByNameIgnoreCase("Inbox")).thenReturn(false);
        Mockito.when(projectRepository.save(ArgumentMatchers.any(Project.class)))
                .thenAnswer(invocation -> {
                    Project project = invocation.getArgument(0);
                    project.setId(UUID.randomUUID());
                    return project;
                });

        ProjectResponse res = projectService.createProject(req);

        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        Mockito.verify(projectRepository).save(projectCaptor.capture());
        Project savedProject = projectCaptor.getValue();
        Assertions.assertEquals("Inbox", savedProject.getName());
        Assertions.assertNull(savedProject.getDescription());
        Assertions.assertNull(savedProject.getColor());
        Assertions.assertNull(res.description());
        Assertions.assertNull(res.color());
    }

    @Test
    void whenCreateProjectWithDuplicateNameShouldThrowIllegalArgumentException() {
        CreateProjectRequest req = new CreateProjectRequest("  Website  ", null, null);
        Mockito.when(projectRepository.existsByNameIgnoreCase("Website")).thenReturn(true);

        IllegalArgumentException ex = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> projectService.createProject(req));

        Assertions.assertEquals("Project name already exists", ex.getMessage());
        Mockito.verify(projectRepository, Mockito.never()).save(ArgumentMatchers.any(Project.class));
    }

    @Test
    void whenUpdateProjectWithDuplicateNameShouldThrowIllegalArgumentException() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder()
                .id(projectId)
                .name("Old Name")
                .build();
        UpdateProjectRequest req = new UpdateProjectRequest("Website", null, null);

        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        Mockito.when(projectRepository.existsByNameIgnoreCaseAndIdNot("Website", projectId)).thenReturn(true);

        IllegalArgumentException ex = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> projectService.updateProject(projectId, req));

        Assertions.assertEquals("Project name already exists", ex.getMessage());
        Mockito.verify(projectRepository, Mockito.never()).save(ArgumentMatchers.any(Project.class));
    }

    @Test
    void whenCreateProjectWithBlankNameShouldFailValidation() {
        CreateProjectRequest emptyName = new CreateProjectRequest("", null, null);
        CreateProjectRequest spacesOnlyName = new CreateProjectRequest("   ", null, null);

        Set<ConstraintViolation<CreateProjectRequest>> emptyViolations = validator.validate(emptyName);
        Set<ConstraintViolation<CreateProjectRequest>> spacesOnlyViolations = validator.validate(spacesOnlyName);

        Assertions.assertTrue(hasProjectNameRequiredViolation(emptyViolations));
        Assertions.assertTrue(hasProjectNameRequiredViolation(spacesOnlyViolations));
    }

    private boolean hasProjectNameRequiredViolation(Set<ConstraintViolation<CreateProjectRequest>> violations) {
        return violations.stream()
                .anyMatch(violation -> "name".equals(violation.getPropertyPath().toString())
                        && "Project name is required".equals(violation.getMessage()));
    }
}
