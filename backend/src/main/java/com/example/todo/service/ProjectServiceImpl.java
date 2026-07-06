package com.example.todo.service;

import com.example.todo.dto.CreateProjectRequest;
import com.example.todo.dto.ProjectResponse;
import com.example.todo.dto.UpdateProjectRequest;
import com.example.todo.entity.Project;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.repository.ProjectRepository;
import com.example.todo.repository.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMapper projectMapper;

    public ProjectServiceImpl(ProjectRepository projectRepository, TaskRepository taskRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectMapper = projectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Override
    public ProjectResponse createProject(CreateProjectRequest request) {
        String name = request.name().trim();
        ensureProjectNameIsUnique(name);
        Project project = Project.builder()
                .name(name)
                .description(normalizeDescription(request.description()))
                .color(normalizeColor(request.color()))
                .build();

        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = findById(id);
        String name = request.name().trim();
        ensureProjectNameIsUniqueForUpdate(name, id);
        project.setName(name);
        project.setDescription(normalizeDescription(request.description()));
        project.setColor(normalizeColor(request.color()));
        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    public void deleteProject(UUID id) {
        Project project = findById(id);
        taskRepository.deleteByProjectId(id);
        projectRepository.delete(project);
    }

    private Project findById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    private void ensureProjectNameIsUnique(String name) {
        if (projectRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Project name already exists");
        }
    }

    private void ensureProjectNameIsUniqueForUpdate(String name, UUID id) {
        if (projectRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Project name already exists");
        }
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private String normalizeColor(String color) {
        if (color == null || color.isBlank()) {
            return null;
        }
        return color.trim();
    }
}
