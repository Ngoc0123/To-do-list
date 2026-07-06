import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createProject, deleteProject, fetchProjects } from "@/services/projects";
import {
  createTask,
  deleteTask,
  fetchTasks,
  StatusFilter,
  TaskDateFilter,
  TaskSort,
  TaskPayload,
  toggleTask,
  updateTask
} from "@/services/tasks";
import { Project, Task, TaskPriority } from "@/types";
import { PAGE_SIZE } from "@/components/tasks/constants";

type ValidationError = Error & {
  details?: Record<string, string>;
};

type TaskModalMode = "create" | "edit";

export type TaskFormState = {
  title: string;
  description: string;
  projectId: string;
  priority: TaskPriority;
  dueDate: string;
};

export type ProjectFormState = {
  name: string;
  description: string;
  color: string;
};

const defaultTaskForm: TaskFormState = {
  title: "",
  description: "",
  projectId: "",
  priority: "MEDIUM",
  dueDate: ""
};

const defaultProjectForm: ProjectFormState = {
  name: "",
  description: "",
  color: "#b84025"
};

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }
  return value.slice(0, 16);
}

function toApiDateTime(value: string) {
  return value ? value : null;
}

function toLocalApiDateTime(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
}

function getDueDateRange(dateFilter: TaskDateFilter | null) {
  if (!dateFilter || dateFilter === "NO_DUE_DATE") {
    return { dueDateFrom: null, dueDateTo: null };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateFilter === "TODAY") {
    return {
      dueDateFrom: toLocalApiDateTime(today),
      dueDateTo: toLocalApiDateTime(tomorrow)
    };
  }

  const nextWeekEnd = new Date(tomorrow);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

  return {
    dueDateFrom: toLocalApiDateTime(tomorrow),
    dueDateTo: toLocalApiDateTime(nextWeekEnd)
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [dateFilter, setDateFilter] = useState<TaskDateFilter | null>(null);
  const [sort, setSort] = useState<TaskSort>("dueDate,asc");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [taskModalMode, setTaskModalMode] = useState<TaskModalMode | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(defaultProjectForm);
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});

  const displayedTasks = tasks;

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const loadProjects = useCallback(async () => {
    try {
      setProjects(await fetchProjects());
    } catch (error) {
      setStatusMessage(error instanceof TypeError ? "Backend API is not running." : error instanceof Error ? error.message : "Unable to load projects");
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const dueDateRange = getDueDateRange(statusFilter === "COMPLETED" ? null : dateFilter);
      const data = await fetchTasks({
        page,
        size: PAGE_SIZE,
        search,
        statusFilter,
        dateFilter: statusFilter === "COMPLETED" ? null : dateFilter,
        ...dueDateRange,
        projectId: selectedProjectId,
        sort
      });
      setTasks(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      if (data.content.length === 0) {
        setStatusMessage("No matching tasks found.");
      }
    } catch (error) {
      setStatusMessage(error instanceof TypeError ? "Backend API is not running." : error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, page, search, selectedProjectId, sort, statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadTasks();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [loadTasks]);

  const setTaskField = <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => {
    setTaskForm((current) => ({ ...current, [field]: value }));
  };

  const setProjectField = <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateTaskModal = () => {
    setErrorMessages({});
    setEditingTask(null);
    setTaskForm({ ...defaultTaskForm, projectId: selectedProjectId ?? "" });
    setTaskModalMode("create");
  };

  const openEditTaskModal = (task: Task) => {
    setErrorMessages({});
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      projectId: task.project?.id ?? "",
      priority: task.priority,
      dueDate: toDateTimeLocal(task.dueDate)
    });
    setTaskModalMode("edit");
  };

  const closeTaskModal = () => {
    setTaskModalMode(null);
    setEditingTask(null);
    setErrorMessages({});
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setProjectErrors({});
    setProjectForm(defaultProjectForm);
  };

  const buildTaskPayload = (): TaskPayload => ({
    title: taskForm.title,
    description: taskForm.description,
    projectId: taskForm.projectId || null,
    priority: taskForm.priority,
    dueDate: toApiDateTime(taskForm.dueDate)
  });

  const handleSubmitTask = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessages({});
    setStatusMessage("");

    try {
      if (taskModalMode === "edit" && editingTask) {
        await updateTask(editingTask.id, { ...buildTaskPayload(), isCompleted: editingTask.isCompleted });
      } else {
        await createTask(buildTaskPayload());
        setPage(0);
      }
      closeTaskModal();
      await loadTasks();
      await loadProjects();
    } catch (error) {
      const validationError = error as ValidationError;
      if (validationError.details) {
        setErrorMessages(validationError.details);
      } else {
        setStatusMessage(validationError.message);
      }
    }
  };

  const handleSubmitProject = async (event: FormEvent) => {
    event.preventDefault();
    setProjectErrors({});

    try {
      const project = await createProject(projectForm);
      closeProjectModal();
      setSelectedProjectId(project.id);
      await loadProjects();
    } catch (error) {
      const validationError = error as ValidationError;
      if (validationError.details) {
        setProjectErrors(validationError.details);
      } else {
        setStatusMessage(validationError.message);
      }
    }
  };

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(0);
  };

  const resetSearchAndFilters = (nextStatusFilter = statusFilter) => {
    setSearch("");
    setDateFilter(null);
    setSort("dueDate,asc");
  };

  const handleStatusFilterChange = (nextFilter: StatusFilter) => {
    setStatusFilter(nextFilter);
    resetSearchAndFilters(nextFilter);
    setPage(0);
  };

  const handleDateFilterChange = (nextFilter: TaskDateFilter | null) => {
    setDateFilter(nextFilter);
    setPage(0);
  };

  const handleSortChange = (nextSort: TaskSort) => {
    setSort(nextSort);
    setPage(0);
  };

  const handleProjectFilterChange = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    resetSearchAndFilters();
    setPage(0);
  };

  const handleToggle = async (id: string) => {
    await toggleTask(id);
    await loadTasks();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    if (tasks.length === 1 && page > 0) {
      setPage((currentPage) => currentPage - 1);
      return;
    }
    await loadTasks();
  };

  const handleDeleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? All tasks that belong to this project will also be deleted. This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setStatusMessage("");

    try {
      await deleteProject(project.id);
      if (selectedProjectId === project.id) {
        setSelectedProjectId(null);
      }
      setPage(0);
      await loadProjects();
      await loadTasks();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to delete project");
    }
  };

  return {
    tasks,
    displayedTasks,
    projects,
    selectedProject,
    selectedProjectId,
    search,
    statusFilter,
    dateFilter,
    sort,
    page,
    totalPages,
    totalElements,
    errorMessages,
    isLoading,
    statusMessage,
    taskModalMode,
    taskForm,
    isProjectModalOpen,
    projectForm,
    projectErrors,
    setPage,
    setDateFilter: handleDateFilterChange,
    setSort: handleSortChange,
    setSelectedProjectId: handleProjectFilterChange,
    setTaskField,
    setProjectField,
    setIsProjectModalOpen,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal,
    closeProjectModal,
    handleSubmitTask,
    handleSubmitProject,
    handleSearchChange,
    handleStatusFilterChange,
    handleToggle,
    handleDelete,
    handleDeleteProject
  };
}

export type TasksViewModel = ReturnType<typeof useTasks>;
