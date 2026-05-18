export interface MemberAccessInvitationPreview {
  memberId: string;
  memberName: string;
  churchName: string;
  email: string | null;
  expiresAt: string;
}

export interface AcceptMemberAccessInvitationPayload {
  token: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}

export interface MemberAccessActivationResponse {
  message: string;
}
