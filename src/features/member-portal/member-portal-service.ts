import { api } from "@/lib/api";

import type { PaginatedResponse, PaginationParams } from "@/lib/pagination";

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
} & PaginationParams) {
  const { data } = await api.get<PaginatedResponse<MemberPortalEvent>>(
    "/member-portal/events",
    { params },
  );
  return data;
}

export async function listMyScheduleAssignments(params?: PaginationParams) {
  const { data } = await api.get<
    PaginatedResponse<MemberPortalScheduleAssignment>
  >(
    "/member-portal/my-schedules",
    { params },
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

export async function listMemberPortalAnnouncements(params?: PaginationParams) {
  const { data } = await api.get<PaginatedResponse<MemberPortalAnnouncement>>(
    "/member-portal/announcements",
    { params },
  );
  return data;
}
