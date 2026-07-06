import { API_URL, parseApiError } from "@/services/api";
import { PaginatedResponse, Task, TaskPriority } from "@/types";

export type StatusFilter = "ACTIVE" | "COMPLETED";
export type TaskSort = "dueDate,asc" | "dueDate,desc";
export type TaskDateFilter = "TODAY" | "NEXT_WEEK" | "NO_DUE_DATE";

export type TaskPayload = {
  title: string;
  description: string;
  projectId?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export async function fetchTasks(params: {
  page: number;
  size: number;
  search: string;
  statusFilter: StatusFilter;
  dateFilter: TaskDateFilter | null;
  dueDateFrom: string | null;
  dueDateTo: string | null;
  projectId: string | null;
  sort: TaskSort;
}): Promise<PaginatedResponse<Task>> {
  const url = new URL(`${API_URL}/tasks`);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("size", String(params.size));
  url.searchParams.set("search", params.search);
  url.searchParams.set("sort", params.sort);

  if (params.statusFilter === "ACTIVE") {
    url.searchParams.set("isCompleted", "false");
  }
  if (params.statusFilter === "COMPLETED") {
    url.searchParams.set("isCompleted", "true");
  }
  if (params.dateFilter) {
    url.searchParams.set("dateFilter", params.dateFilter);
  }
  if (params.dueDateFrom) {
    url.searchParams.set("dueDateFrom", params.dueDateFrom);
  }
  if (params.dueDateTo) {
    url.searchParams.set("dueDateTo", params.dueDateTo);
  }
  if (params.projectId) {
    url.searchParams.set("projectId", params.projectId);
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw await parseApiError(res, "Unable to load tasks");
  }
  return res.json();
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw await parseApiError(res, "Unable to create task");
  }

  return res.json();
}

export async function updateTask(
  id: string,
  payload: TaskPayload & { isCompleted: boolean }
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw await parseApiError(res, "Unable to update task");
  }

  return res.json();
}

export async function toggleTask(id: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}/toggle`, { method: "PATCH" });
  if (!res.ok) {
    throw await parseApiError(res, "Unable to update task status");
  }
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw await parseApiError(res, "Unable to delete task");
  }
}
