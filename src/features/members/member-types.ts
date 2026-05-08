export interface Member {
  id: string;
  name: string;
  whatsapp: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberPayload {
  name: string;
  whatsapp: string;
}
