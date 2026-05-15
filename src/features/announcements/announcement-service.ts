import { api } from "@/lib/api";
import type { PaginatedResponse, PaginationParams } from "@/lib/pagination";

import type { Announcement, AnnouncementPayload } from "./announcement-types";

export async function listAnnouncements(params?: PaginationParams) {
  const { data } = await api.get<PaginatedResponse<Announcement>>(
    "/announcements",
    { params },
  );
  return data;
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const { data } = await api.post<Announcement>("/announcements", payload);
  return data;
}

export async function updateAnnouncement(
  announcementId: string,
  payload: AnnouncementPayload,
) {
  const { data } = await api.patch<Announcement>(
    `/announcements/${announcementId}`,
    payload,
  );
  return data;
}

export async function deleteAnnouncement(announcementId: string) {
  await api.delete(`/announcements/${announcementId}`);
}
