import { api } from "@/lib/api";

import type { PaginatedResponse, PaginationParams } from "@/lib/pagination";

import type {
  DonationCampaign,
  DonationCampaignPayload,
} from "./donation-types";

export async function listDonationCampaigns(params?: PaginationParams) {
  const { data } = await api.get<PaginatedResponse<DonationCampaign>>(
    "/donation-campaigns",
    { params },
  );
  return data;
}

export async function createDonationCampaign(
  payload: DonationCampaignPayload,
) {
  const { data } = await api.post<DonationCampaign>(
    "/donation-campaigns",
    payload,
  );
  return data;
}

export async function updateDonationCampaign(
  campaignId: string,
  payload: DonationCampaignPayload,
) {
  const { data } = await api.patch<DonationCampaign>(
    `/donation-campaigns/${campaignId}`,
    payload,
  );
  return data;
}

export async function deleteDonationCampaign(campaignId: string) {
  await api.delete(`/donation-campaigns/${campaignId}`);
}

export async function listMemberPortalDonations(params?: PaginationParams) {
  const { data } = await api.get<PaginatedResponse<DonationCampaign>>(
    "/member-portal/donations",
    { params },
  );
  return data;
}
