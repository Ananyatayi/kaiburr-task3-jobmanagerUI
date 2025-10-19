import api from "./client";
import type { Task } from "../types";

export async function listTasks(): Promise<Task[]> {
  const { data } = await api.get("/tasks");
  return data;
}

export async function createTask(
  t: Omit<Task, "id" | "taskExecutions">
): Promise<Task> {
  const payload = { ...t, taskExecutions: [] };
  const { data } = await api.put("/tasks", payload);
  return data;
}

export async function findTasksByName(q: string): Promise<Task[]> {
  // backend expects /tasks/find?name=...
  const { data } = await api.get(`/tasks/find`, { params: { name: q } });
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function runTask(id: string): Promise<{ startTime: string; endTime: string; output: string }> {
  const { data } = await api.put(`/tasks/${id}/execution`);
  return data;
}
