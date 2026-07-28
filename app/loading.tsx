export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div
        className="text-muted-foreground animate-pulse text-sm"
        role="status"
        aria-live="polite"
      >
        加载中…
      </div>
    </main>
  );
}
