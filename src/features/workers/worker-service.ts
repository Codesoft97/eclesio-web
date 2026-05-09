import { api } from "@/lib/api";

import type {
  CreateWorkerMinistryPayload,
  CreateWorkerPayload,
  CreateWorkerRolePayload,
  UpdateWorkerMinistryPayload,
  UpdateWorkerPayload,
  UpdateWorkerRolePayload,
  Worker,
  WorkerMinistry,
  WorkerRole,
} from "./worker-types";

export async function listWorkerMinistries() {
  const { data } = await api.get<WorkerMinistry[]>("/worker-ministries");
  return data;
}

export async function createWorkerMinistry(
  payload: CreateWorkerMinistryPayload,
) {
  const { data } = await api.post<WorkerMinistry>(
    "/worker-ministries",
    payload,
  );
  return data;
}

export async function updateWorkerMinistry(
  ministryId: string,
  payload: UpdateWorkerMinistryPayload,
) {
  const { data } = await api.patch<WorkerMinistry>(
    `/worker-ministries/${ministryId}`,
    payload,
  );
  return data;
}

export async function deleteWorkerMinistry(ministryId: string) {
  await api.delete(`/worker-ministries/${ministryId}`);
}

export async function createWorkerRole(payload: CreateWorkerRolePayload) {
  const { data } = await api.post<WorkerRole>("/worker-roles", payload);
  return data;
}

export async function updateWorkerRole(
  roleId: string,
  payload: UpdateWorkerRolePayload,
) {
  const { data } = await api.patch<WorkerRole>(
    `/worker-roles/${roleId}`,
    payload,
  );
  return data;
}

export async function deleteWorkerRole(roleId: string) {
  await api.delete(`/worker-roles/${roleId}`);
}

export async function listWorkers() {
  const { data } = await api.get<Worker[]>("/workers");
  return data;
}

export async function createWorker(payload: CreateWorkerPayload) {
  const { data } = await api.post<Worker>("/workers", payload);
  return data;
}

export async function updateWorker(
  workerId: string,
  payload: UpdateWorkerPayload,
) {
  const { data } = await api.patch<Worker>(`/workers/${workerId}`, payload);
  return data;
}

export async function deleteWorker(workerId: string) {
  await api.delete(`/workers/${workerId}`);
}
