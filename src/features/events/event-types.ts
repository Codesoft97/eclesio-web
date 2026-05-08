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

export interface EventShareResponse {
  event: ChurchEvent;
  shareUrl: string;
  message: string;
}

export interface PublicChurchEvent {
  shareToken: string;
  title: string;
  description: string;
  startsAt: string;
  church: {
    name: string;
    slug: string;
  };
}
