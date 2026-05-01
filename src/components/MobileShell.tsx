import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
};

export function MobileShell({ children }: MobileShellProps) {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_24px_60px_rgba(255,143,163,0.2)]">
        {children}
      </div>
    </main>
  );
}
