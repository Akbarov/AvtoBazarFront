export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="px-5 py-[54px] text-center text-muted">
      <div className="mb-1 text-[14px] font-semibold text-fg-2">{title}</div>
      {message && <div className="text-[12.5px]">{message}</div>}
    </div>
  )
}
