package com.example.todo.service;

import com.example.todo.dto.CreateTaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.dto.UpdateTaskRequest;
import com.example.todo.entity.Project;
import com.example.todo.entity.Task;
import com.example.todo.entity.TaskPriority;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.repository.ProjectRepository;
import com.example.todo.repository.TaskRepository;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskRepository taskRepository, ProjectRepository projectRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(
            String search,
            Boolean isCompleted,
            String dateFilter,
            LocalDateTime dueDateFrom,
            LocalDateTime dueDateTo,
            UUID projectId,
            Pageable pageable) {
        String normalizedSearch = search == null ? "" : search.trim();
        DateRange dateRange = DateRange.from(dateFilter, dueDateFrom, dueDateTo);
        Sort.Direction dueDateDirection = dueDateSortDirection(pageable.getSort());
        Page<Task> page = taskRepository.findAll(
                taskSpecification(
                        normalizedSearch,
                        isCompleted,
                        projectId,
                        dateRange.start(),
                        dateRange.end(),
                        dateRange.withoutDueDate(),
                        dueDateDirection),
                PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));

        return page.map(taskMapper::toResponse);
    }

    @Override
    public TaskResponse createTask(CreateTaskRequest request) {
        Task task = Task.builder()
                .title(request.title().trim())
                .description(normalizeDescription(request.description()))
                .project(findProjectById(request.projectId()))
                .priority(normalizePriority(request.priority()))
                .dueDate(request.dueDate())
                .isCompleted(false)
                .build();

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse updateTask(UUID id, UpdateTaskRequest request) {
        Task task = findById(id);
        task.setTitle(request.title().trim());
        task.setDescription(normalizeDescription(request.description()));
        task.setProject(findProjectById(request.projectId()));
        task.setPriority(normalizePriority(request.priority()));
        task.setDueDate(request.dueDate());
        task.setCompleted(request.isCompleted());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse toggleTask(UUID id) {
        Task task = findById(id);
        task.setCompleted(!task.isCompleted());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Override
    public void deleteTask(UUID id) {
        Task task = findById(id);
        taskRepository.delete(task);
    }

    private Task findById(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private Project findProjectById(UUID projectId) {
        if (projectId == null) {
            return null;
        }

        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
    }

    private TaskPriority normalizePriority(TaskPriority priority) {
        return priority == null ? TaskPriority.MEDIUM : priority;
    }

    private Specification<Task> taskSpecification(
            String search,
            Boolean isCompleted,
            UUID projectId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            boolean withoutDueDate,
            Sort.Direction dueDateDirection) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (isCompleted != null) {
                predicates.add(criteriaBuilder.equal(root.get("isCompleted"), isCompleted));
            }
            if (projectId != null) {
                predicates.add(criteriaBuilder.equal(root.get("project").get("id"), projectId));
            }
            if (withoutDueDate) {
                predicates.add(criteriaBuilder.isNull(root.get("dueDate")));
            }
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dueDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThan(root.get("dueDate"), endDate));
            }
            if (!search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Expression<String> title = criteriaBuilder.lower(root.get("title"));
                Expression<String> description = criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("description"), ""));
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(title, pattern),
                        criteriaBuilder.like(description, pattern)));
            }

            if (query != null && !Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                Order dueDateOrder = dueDateDirection == Sort.Direction.DESC
                        ? criteriaBuilder.desc(root.get("dueDate"))
                        : criteriaBuilder.asc(root.get("dueDate"));

                query.orderBy(
                        criteriaBuilder.asc(criteriaBuilder.selectCase().when(criteriaBuilder.isNull(root.get("dueDate")), 1).otherwise(0)),
                        dueDateOrder,
                        criteriaBuilder.desc(root.get("createdAt")));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort.Direction dueDateSortDirection(Sort sort) {
        return sort.stream()
                .filter(order -> "dueDate".equals(order.getProperty()))
                .findFirst()
                .map(Sort.Order::getDirection)
                .orElse(Sort.Direction.ASC);
    }

    private record DateRange(LocalDateTime start, LocalDateTime end, boolean withoutDueDate) {
        static DateRange from(String dateFilter, LocalDateTime dueDateFrom, LocalDateTime dueDateTo) {
            if (dueDateFrom != null || dueDateTo != null) {
                return new DateRange(dueDateFrom, dueDateTo, false);
            }

            if (dateFilter == null || dateFilter.isBlank()) {
                return new DateRange(null, null, false);
            }

            if ("NO_DUE_DATE".equalsIgnoreCase(dateFilter)) {
                return new DateRange(null, null, true);
            }

            LocalDate today = LocalDate.now();
            if ("TODAY".equalsIgnoreCase(dateFilter)) {
                return new DateRange(today.atStartOfDay(), today.plusDays(1).atStartOfDay(), false);
            }
            if ("NEXT_WEEK".equalsIgnoreCase(dateFilter)) {
                return new DateRange(today.plusDays(1).atStartOfDay(), today.plusDays(8).atStartOfDay(), false);
            }

            return new DateRange(null, null, false);
        }
    }
}
