// src/app/[locale]/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-100 px-4 dark:bg-ink-900">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
