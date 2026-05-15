import { api } from "@/lib/api";

export interface UploadedImage {
  id: string;
  imageUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<UploadedImage>("/media/images", formData);

  return response.data;
}
