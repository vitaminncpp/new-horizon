import type { PropsWithChildren } from "react";
import { Button } from "@/src/components/common/button";

type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
}>;

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6"
    >
      <div className="w-full max-w-lg rounded-[1.5rem] bg-surface-lowest p-8 card-shadow">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-low hover:text-text-primary"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="space-y-6">{children}</div>
        <div className="mt-6">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
