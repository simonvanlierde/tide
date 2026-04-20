import type { ReactNode } from "react";

interface StatusMessageProps {
  children: ReactNode;
  className?: string;
}

export function StatusMessage({
  children,
  className = "status-chip status-chip--muted",
}: StatusMessageProps) {
  return (
    <p className={className} role="status" aria-live="polite">
      {children}
    </p>
  );
}
