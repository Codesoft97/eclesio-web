/* eslint-disable @next/next/no-img-element */
"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MemberPortalImagePreviewProps {
  src: string;
  label: string;
  className?: string;
}

export function MemberPortalImagePreview({
  src,
  label,
  className = "",
}: MemberPortalImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`overflow-hidden rounded-lg border border-border bg-surface-subtle ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex max-h-[420px] w-full cursor-zoom-in items-center justify-center bg-surface"
          aria-label={`Visualizar ${label} em tela cheia`}
        >
          <img
            src={src}
            alt=""
            className="max-h-[420px] max-w-full object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 size={17} />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Fechar imagem"
            onClick={(event) => {
              event.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={22} />
          </button>
          <img
            src={src}
            alt=""
            className="max-h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
