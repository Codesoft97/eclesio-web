export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPayload {
  title: string;
  description: string;
  startsAt: string;
}
