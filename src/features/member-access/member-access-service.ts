import { api } from "@/lib/api";

import type {
  AcceptMemberAccessInvitationPayload,
  MemberAccessActivationResponse,
  MemberAccessInvitationPreview,
} from "./member-access-types";

export async function getMemberAccessInvitation(token: string) {
  const { data } = await api.get<MemberAccessInvitationPreview>(
    `/member-access/invitations/${token}`,
  );
  return data;
}

export async function acceptMemberAccessInvitation(
  payload: AcceptMemberAccessInvitationPayload,
) {
  const { data } = await api.post<MemberAccessActivationResponse>(
    "/member-access/invitations/accept",
    payload,
  );
  return data;
}
