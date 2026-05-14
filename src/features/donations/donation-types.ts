export interface DonationCampaign {
  id: string;
  title: string;
  description: string | null;
  pixKey: string;
  receiverName: string | null;
  receiverCity: string | null;
  isActive: boolean;
  pixCopyPaste: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCampaignPayload {
  title: string;
  description?: string;
  pixKey: string;
  receiverName?: string;
  receiverCity?: string;
  isActive?: boolean;
}
