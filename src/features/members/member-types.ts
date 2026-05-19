export type PortalAccessStatus = "NONE" | "ACTIVE" | "INACTIVE";

export interface Member {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string;
  isActive: boolean;
  hasPortalAccess: boolean;
  portalAccessStatus: PortalAccessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MemberPayload {
  name: string;
  email?: string;
  whatsapp: string;
  isActive?: boolean;
}

export interface MemberAccessInvitation {
  memberId: string;
  memberName: string;
  churchName: string;
  inviteUrl: string;
  expiresAt: string;
}
