interface Props {
  code: string | null | undefined
  size?: number
}

// Filled square for a color hex; OTHER/null renders a striped placeholder.
export function ColorSwatch({ code, size = 15 }: Props) {
  const style = code
    ? { background: code }
    : {
        backgroundImage:
          'repeating-linear-gradient(45deg, var(--border-strong) 0 3px, transparent 3px 6px)',
      }
  return (
    <span
      className="inline-block flex-shrink-0 rounded border border-border-strong"
      style={{ width: size, height: size, ...style }}
    />
  )
}
