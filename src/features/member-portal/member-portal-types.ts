export type MemberPortalScheduleStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface MemberPortalProfile {
  church: {
    id: string;
    name: string;
    slug: string;
  };
  member: {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string;
    isActive: boolean;
  };
  worker: {
    id: string;
    ministry: {
      id: string;
      name: string;
    };
    role: {
      id: string;
      name: string;
    };
  } | null;
}

export interface MemberPortalEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startsAt: string;
  isRecurring: boolean;
  recurrenceGroupId: string | null;
  recurrenceEndsAt: string | null;
  recurrenceWeekday: number | null;
  myScheduleAssignments: MemberPortalEventScheduleAssignment[];
}

export interface MemberPortalEventScheduleAssignment {
  id: string;
  ministry: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
  worker: {
    id: string;
    name: string;
  };
  confirmationStatus: MemberPortalScheduleStatus;
  respondedAt: string | null;
}

export interface MemberPortalScheduleAssignment {
  id: string;
  event: MemberPortalEvent;
  ministry: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
  confirmationStatus: MemberPortalScheduleStatus;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberPortalAnnouncement {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
  viewsCount: number;
  likesCount: number;
  likedByMe: boolean;
}

export interface UpdateMemberPortalProfilePayload {
  name?: string;
  email?: string;
  whatsapp?: string;
}
