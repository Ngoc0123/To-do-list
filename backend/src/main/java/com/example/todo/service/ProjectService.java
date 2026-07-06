package com.example.todo.service;

import com.example.todo.dto.CreateProjectRequest;
import com.example.todo.dto.ProjectResponse;
import com.example.todo.dto.UpdateProjectRequest;
import java.util.List;
import java.util.UUID;

public interface ProjectService {
    List<ProjectResponse> getProjects();

    ProjectResponse createProject(CreateProjectRequest request);

    ProjectResponse updateProject(UUID id, UpdateProjectRequest request);

    void deleteProject(UUID id);
}
