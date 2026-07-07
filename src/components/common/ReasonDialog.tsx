import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'

interface ReasonDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  danger?: boolean
  placeholder?: string
  pending?: boolean
  onClose: () => void
  onSubmit: (reason: string | undefined) => void
}

/** Confirm dialog with an optional free-text reason (reject/suspend flows). */
export function ReasonDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  placeholder,
  pending,
  onClose,
  onSubmit,
}: ReasonDialogProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            disabled={pending}
            onClick={() => onSubmit(reason.trim() || undefined)}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {message && <p className="text-[13px] text-fg-2">{message}</p>}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-y rounded-[9px] border border-border-strong bg-surface px-3 py-2 text-[13px] text-fg outline-none focus:border-accent"
        />
      </div>
    </Modal>
  )
}
