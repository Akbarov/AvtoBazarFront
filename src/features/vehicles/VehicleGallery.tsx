import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
}

/**
 * Vehicle photo gallery: a main viewer with prev/next navigation, a clickable
 * thumbnail strip, and a fullscreen lightbox (click the main image or a thumb).
 * Keyboard: ←/→ to flip, Esc to close the lightbox.
 */
export function VehicleGallery({ images }: Props) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const count = images.length
  const safeIndex = count ? Math.min(index, count - 1) : 0

  const go = useCallback(
    (dir: number) => {
      if (!count) return
      setIndex((i) => (i + dir + count) % count)
    },
    [count],
  )

  // Keyboard control while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    // Prevent the page from scrolling behind the fullscreen overlay.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox, go])

  if (!count) {
    return (
      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="flex aspect-video items-center justify-center bg-surface-2 text-muted">
          <ImageIcon size={38} strokeWidth={1.4} />
        </div>
      </div>
    )
  }

  const current = images[safeIndex]

  return (
    <>
      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="group relative aspect-video border-b border-border bg-surface-2">
          <img
            src={current}
            alt=""
            className="h-full w-full cursor-zoom-in object-cover"
            onClick={() => setLightbox(true)}
          />
          {count > 1 && (
            <>
              <NavButton side="left" label={t('vehicles.prevImage')} onClick={() => go(-1)} />
              <NavButton side="right" label={t('vehicles.nextImage')} onClick={() => go(1)} />
              <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] font-medium text-white">
                {safeIndex + 1} / {count}
              </div>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-16 w-[88px] flex-shrink-0 overflow-hidden rounded-lg border transition-colors',
                  i === safeIndex ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-border-strong',
                )}
              >
                <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 animate-ab-fadein"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label={t('vehicles.closeGallery')}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          <img
            src={current}
            alt=""
            className="max-h-[88vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {count > 1 && (
            <>
              <NavButton side="left" large label={t('vehicles.prevImage')} onClick={() => go(-1)} />
              <NavButton side="right" large label={t('vehicles.nextImage')} onClick={() => go(1)} />
              <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-[12px] font-medium text-white">
                {safeIndex + 1} / {count}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

function NavButton({
  side,
  large,
  label,
  onClick,
}: {
  side: 'left' | 'right'
  large?: boolean
  label: string
  onClick: () => void
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70',
        side === 'left' ? 'left-3' : 'right-3',
        large ? 'h-11 w-11' : 'h-9 w-9',
      )}
    >
      <Icon size={large ? 24 : 20} />
    </button>
  )
}
