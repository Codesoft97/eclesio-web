export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

export const IMAGE_UPLOAD_ACCEPT =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/x-png",
  "image/webp",
]);

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function isAllowedImageFile(file: File) {
  const type = file.type.trim().toLowerCase();

  if (type.length > 0) {
    return ALLOWED_IMAGE_TYPES.has(type);
  }

  const fileName = file.name.trim().toLowerCase();

  return ALLOWED_IMAGE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension),
  );
}
