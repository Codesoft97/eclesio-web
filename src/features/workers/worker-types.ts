export interface WorkerRole {
  id: string;
  ministryId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerMinistry {
  id: string;
  name: string;
  roles: WorkerRole[];
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  whatsapp: string;
  ministryId: string;
  ministry: {
    id: string;
    name: string;
  };
  roleId: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkerPayload {
  name: string;
  whatsapp: string;
  ministryId: string;
  roleId: string;
}

export interface UpdateWorkerPayload {
  name?: string;
  whatsapp?: string;
  ministryId?: string;
  roleId?: string;
}

export interface CreateWorkerMinistryPayload {
  name: string;
  roles: string[];
}

export interface UpdateWorkerMinistryPayload {
  name?: string;
}

export interface CreateWorkerRolePayload {
  ministryId: string;
  name: string;
}

export interface UpdateWorkerRolePayload {
  name?: string;
}
