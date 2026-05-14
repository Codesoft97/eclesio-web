import { api } from "@/lib/api";

import type { Announcement, AnnouncementPayload } from "./announcement-types";

export async function listAnnouncements() {
  const { data } = await api.get<Announcement[]>("/announcements");
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
