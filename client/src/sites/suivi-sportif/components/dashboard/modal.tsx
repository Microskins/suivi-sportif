import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-[#2b241e]/45 px-4 py-8 backdrop-blur-sm">
      <div className="panel w-full max-w-3xl shadow-[0_20px_60px_rgba(43,36,30,0.2)]">
        <div className="flex items-center justify-between border-b border-[#f0e3d6] px-5 py-4">
          <h2 className="site-display text-xl font-bold text-[#2b241e]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="sport-secondary-button min-h-9 px-3 py-1"
          >
            Fermer
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
