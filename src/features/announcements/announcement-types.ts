export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt: string | null;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementPayload {
  title: string;
  content: string;
  isPublished?: boolean;
}
