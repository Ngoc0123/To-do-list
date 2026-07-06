import { API_URL, parseApiError } from "@/services/api";
import { Project } from "@/types";

export type ProjectPayload = {
  name: string;
  description?: string;
  color?: string;
};

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`);
  if (!res.ok) {
    throw await parseApiError(res, "Unable to load projects");
  }
  return res.json();
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw await parseApiError(res, "Unable to create project");
  }

  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/projects/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw await parseApiError(res, "Unable to delete project");
  }
}
