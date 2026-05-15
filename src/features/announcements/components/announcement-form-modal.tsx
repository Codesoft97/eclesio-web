 
"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { ImagePlus, Megaphone, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { uploadImage } from "@/features/media/media-service";
import { getApiErrorMessage } from "@/lib/api";

import type { Announcement, AnnouncementPayload } from "../announcement-types";

type AnnouncementFormMode = "create" | "edit";

interface AnnouncementFormModalProps {
  mode: AnnouncementFormMode;
  announcement: Announcement | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AnnouncementPayload) => void;
}

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function AnnouncementFormModal({
  mode,
  announcement,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps) {
  const [form, setForm] = useState(() => ({
    title: announcement?.title ?? "",
    content: announcement?.content ?? "",
    isPublished: announcement?.isPublished ?? false,
  }));
  const [imageAssetId, setImageAssetId] = useState<string | null | undefined>(
    undefined,
  );
  const [previewImageUrl, setPreviewImageUrl] = useState(
    announcement?.imageUrl ?? "",
  );
  const [imageInputKey, setImageInputKey] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function updateField<FieldName extends keyof typeof form>(
    field: FieldName,
    value: (typeof form)[FieldName],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLocalError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setLocalError("Use uma imagem em JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setLocalError("A imagem deve ter no maximo 3 MB.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadImage(file);
      setImageAssetId(uploadedImage.id);
      setPreviewImageUrl(uploadedImage.imageUrl);
    } catch (uploadError) {
      setLocalError(getApiErrorMessage(uploadError));
      event.target.value = "";
    } finally {
      setIsUploadingImage(false);
    }
  }

  function removeImage() {
    setImageAssetId(null);
    setPreviewImageUrl("");
    setImageInputKey((current) => current + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (isUploadingImage) {
      setLocalError("Aguarde o envio da imagem terminar.");
      return;
    }

    const payload: AnnouncementPayload = {
      title: form.title.trim().replace(/\s+/g, " "),
      content: form.content.trim(),
      isPublished: form.isPublished,
    };

    if (imageAssetId !== undefined) {
      payload.imageAssetId = imageAssetId;
    }

    if (payload.title.length < 3) {
      setLocalError("Informe um titulo com pelo menos 3 caracteres.");
      return;
    }

    if (payload.content.length < 3) {
      setLocalError("Informe o conteudo do comunicado.");
      return;
    }

    onSubmit(payload);
  }

  const title = mode === "create" ? "Novo comunicado" : "Editar comunicado";
  const submitLabel = mode === "create" ? "Criar comunicado" : "Salvar";
  const Icon = mode === "create" ? Megaphone : Save;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        className="animate-scale-in w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Comunicados
            </p>
            <h2
              id="announcement-modal-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Publique avisos simples para aparecerem no portal dos membros.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar modal"
            disabled={isSubmitting || isUploadingImage}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-5">
          <Field
            label="Titulo"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Culto especial de domingo"
            maxLength={120}
            required
          />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            <span>Conteudo</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              placeholder="Escreva o comunicado para os membros..."
              rows={7}
              maxLength={5000}
              required
              className="min-h-40 rounded-lg border border-border bg-surface-subtle px-3.5 py-3 text-sm text-foreground shadow-xs transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </label>

          {/* <div className="grid gap-3 rounded-lg border border-border bg-surface-subtle p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Imagem</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  JPG, PNG ou WebP de ate 3 MB.
                </p>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60">
                <ImagePlus size={16} />
                {isUploadingImage ? "Enviando..." : "Enviar imagem"}
                <input
                  key={imageInputKey}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImageChange}
                  disabled={isSubmitting || isUploadingImage}
                />
              </label>
            </div>

            {previewImageUrl ? (
              <div className="grid gap-3">
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <img
                    src={previewImageUrl}
                    alt=""
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-semibold text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  Remover imagem
                </button>
              </div>
            ) : null}
          </div> */}

          <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle p-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                updateField("isPublished", event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span>
              <span className="block font-semibold">Publicar agora</span>
              <span className="text-xs leading-5 text-muted">
                Comunicados publicados aparecem no portal dos membros.
              </span>
            </span>
          </label>

          {localError || error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {localError ?? error}
            </p>
          ) : null}

          <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting || isUploadingImage}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingImage}>
              <Icon size={17} />
              {isUploadingImage
                ? "Enviando imagem..."
                : isSubmitting
                  ? "Salvando..."
                  : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
