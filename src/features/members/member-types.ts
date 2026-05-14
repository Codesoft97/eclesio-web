export interface Member {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string;
  isActive: boolean;
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
