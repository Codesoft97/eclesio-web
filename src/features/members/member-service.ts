import { api } from "@/lib/api";

import type { Member, MemberPayload } from "./member-types";

export async function listMembers() {
  const { data } = await api.get<Member[]>("/members");
  return data;
}

export async function createMember(payload: MemberPayload) {
  const { data } = await api.post<Member>("/members", payload);
  return data;
}

export async function updateMember(memberId: string, payload: MemberPayload) {
  const { data } = await api.patch<Member>(`/members/${memberId}`, payload);
  return data;
}

export async function deleteMember(memberId: string) {
  await api.delete(`/members/${memberId}`);
}
