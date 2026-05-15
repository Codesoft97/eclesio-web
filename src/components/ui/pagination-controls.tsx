import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/pagination";

interface PaginationControlsProps {
  meta: PaginationMeta;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  meta,
  isLoading = false,
  onPageChange,
}: PaginationControlsProps) {
  if (meta.totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border p-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        Pagina {meta.page} de {meta.totalPages} - {meta.totalItems} item(s)
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={isLoading || !meta.hasPreviousPage}
        >
          <ChevronLeft size={16} />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={isLoading || !meta.hasNextPage}
        >
          Proxima
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
