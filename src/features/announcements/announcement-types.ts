export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
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
  imageAssetId?: string | null;
  isPublished?: boolean;
}
