import { api } from "@/lib/api";

import type {
  MemberPortalAnnouncement,
  MemberPortalEvent,
  MemberPortalProfile,
  MemberPortalScheduleAssignment,
  UpdateMemberPortalProfilePayload,
} from "./member-portal-types";

export async function getMemberPortalProfile() {
  const { data } = await api.get<MemberPortalProfile>("/member-portal/me");
  return data;
}

export async function updateMemberPortalProfile(
  payload: UpdateMemberPortalProfilePayload,
) {
  const { data } = await api.patch<MemberPortalProfile>(
    "/member-portal/me",
    payload,
  );
  return data;
}

export async function listMemberPortalEvents(params?: {
  from?: string;
  to?: string;
}) {
  const { data } = await api.get<MemberPortalEvent[]>("/member-portal/events", {
    params,
  });
  return data;
}

export async function listMyScheduleAssignments() {
  const { data } = await api.get<MemberPortalScheduleAssignment[]>(
    "/member-portal/my-schedules",
  );
  return data;
}

export async function acceptMyScheduleAssignment(assignmentId: string) {
  const { data } = await api.post<MemberPortalScheduleAssignment>(
    `/member-portal/my-schedules/${assignmentId}/accept`,
  );
  return data;
}

export async function declineMyScheduleAssignment(assignmentId: string) {
  const { data } = await api.post<MemberPortalScheduleAssignment>(
    `/member-portal/my-schedules/${assignmentId}/decline`,
  );
  return data;
}

export async function listMemberPortalAnnouncements() {
  const { data } = await api.get<MemberPortalAnnouncement[]>(
    "/member-portal/announcements",
  );
  return data;
}
