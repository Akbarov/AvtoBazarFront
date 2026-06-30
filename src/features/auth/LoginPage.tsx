import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { Car, Send } from 'lucide-react'
import { authApi } from '@/lib/api/resources/auth'
import { tokenStore } from '@/lib/auth/tokenStore'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const { t } = useTranslation()
  const { completeLogin } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [link, setLink] = useState<{ botUsername: string; deepLink: string } | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    authApi.telegramLink().then(setLink).catch(() => setLink(null))
  }, [])

  async function onVerify() {
    if (code.length !== 4 || busy) return
    setBusy(true)
    setError(false)
    try {
      const auth = await authApi.verifyCode(code)
      tokenStore.setSession(auth)
      await completeLogin()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-6"
      style={{ background: 'radial-gradient(1200px 600px at 70% -10%, var(--accent-soft), transparent 60%), var(--bg)' }}
    >
      <div className="absolute right-6 top-5">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[404px] rounded-[18px] border border-border bg-surface p-9 shadow">
        <div className="mb-[26px] flex items-center gap-[11px]">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-accent text-white">
            <Car size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-tight">AvtoBazar</div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-accent">ADMIN PANEL</div>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="mb-1.5 text-[20px] font-bold tracking-tight">{t('login.title')}</div>
            <div className="mb-[22px] leading-relaxed text-fg-2">{t('login.subtitle')}</div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                if (link?.deepLink) window.open(link.deepLink, '_blank')
                setStep(2)
              }}
            >
              <Send size={18} /> {t('login.getCode')}
            </Button>
            <div className="my-[18px] flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="text-[11px] text-muted">
                {t('login.bot')} {link?.botUsername ? `@${link.botUsername}` : '…'}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            {link?.deepLink && (
              <div className="flex items-start gap-3 rounded-[11px] border border-border bg-surface-2 p-[13px]">
                <div className="flex-shrink-0 rounded-lg bg-white p-1.5">
                  <QRCodeSVG value={link.deepLink} size={74} />
                </div>
                <div className="text-[12px] leading-relaxed text-fg-2">{t('login.enterCodeHint')}</div>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-1.5 text-[20px] font-bold tracking-tight">{t('login.enterCode')}</div>
            <div className="mb-[22px] leading-relaxed text-fg-2">{t('login.enterCodeHint')}</div>
            <div className="mb-2 flex gap-[10px]">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'flex h-[58px] flex-1 items-center justify-center rounded-[12px] border-[1.5px] bg-surface-2 font-mono text-[24px] font-semibold',
                    i === code.length ? 'border-accent' : 'border-border',
                  )}
                >
                  {code[i] ?? ''}
                </div>
              ))}
            </div>
            {error && <div className="mb-2 text-[12px] text-danger">{t('login.invalidCode')}</div>}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              className="mt-2 h-[46px] w-full rounded-[11px] border-[1.5px] border-border-strong bg-surface text-center font-mono text-[18px] tracking-[0.5em] outline-none"
            />
            <Button size="lg" className="mt-3.5 w-full" disabled={code.length !== 4 || busy} onClick={onVerify}>
              {t('login.signIn')}
            </Button>
            <button
              onClick={() => {
                setStep(1)
                setCode('')
                setError(false)
              }}
              className="mt-3 w-full text-center text-[12px] font-medium text-accent"
            >
              {t('login.requestNew')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
