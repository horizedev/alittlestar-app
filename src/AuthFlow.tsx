import { useState, type FormEvent } from 'react'
import {
  Baby,
  LoaderCircle,
  QrCode,
  Sparkles,
  Star,
  UserPlus,
  X,
} from 'lucide-react'

export function LoadingScreen() {
  return (
    <main className="loading-screen" aria-live="polite">
      <span className="brand-mark">
        <Star size={24} fill="currentColor" />
      </span>
      <LoaderCircle className="spin" size={24} />
      <p>正在準備你的小天地…</p>
    </main>
  )
}

export function ChildSetup({
  pendingInvitation,
  onCreate,
  onAcceptInvitation,
  onDismissInvitation,
  onSignOut,
}: {
  pendingInvitation: boolean
  onCreate: (name: string, birthDate: string | null) => Promise<string | null>
  onAcceptInvitation: () => Promise<string | null>
  onDismissInvitation: () => void
  onSignOut: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [busyAction, setBusyAction] = useState<'create' | 'accept' | null>(null)
  const [error, setError] = useState('')

  const createChild = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('請輸入孩子的稱呼。')
      return
    }

    setBusyAction('create')
    setError('')
    const message = await onCreate(trimmedName, birthDate || null)
    if (message) {
      setError(message)
      setBusyAction(null)
    }
  }

  const acceptInvitation = async () => {
    setBusyAction('accept')
    setError('')
    const message = await onAcceptInvitation()
    if (message) {
      setError(message)
      setBusyAction(null)
    }
  }

  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="auth-brand compact">
          <span className="brand-mark">
            <Star size={22} fill="currentColor" />
          </span>
          <span>A Little Star</span>
        </div>

        {pendingInvitation ? (
          <div className="setup-invite">
            <span className="setup-icon purple"><QrCode size={25} /></span>
            <div>
              <span className="eyebrow">共同管理邀請</span>
              <h1>加入孩子的照顧團隊</h1>
              <p>接受後，你可以與邀請者一起查看及更新每日記錄和覆診筆記。</p>
            </div>
            <button
              className="primary-button"
              type="button"
              disabled={busyAction !== null}
              onClick={acceptInvitation}
            >
              {busyAction === 'accept' ? <LoaderCircle className="spin" size={18} /> : <UserPlus size={18} />}
              接受邀請
            </button>
            <button className="text-button" type="button" onClick={onDismissInvitation}>
              暫不加入，改為建立新檔案
            </button>
          </div>
        ) : null}

        <div className="setup-divider">
          <span>{pendingInvitation ? '或者' : '開始使用'}</span>
        </div>

        <form className="child-form" onSubmit={createChild}>
          <span className="setup-icon green"><Baby size={25} /></span>
          <div>
            <span className="eyebrow">建立孩子檔案</span>
            <h1>先告訴我們怎樣稱呼孩子</h1>
            <p>稍後可再加入其他孩子，或邀請家人一起管理。</p>
          </div>
          <label>
            <span>孩子稱呼</span>
            <input
              autoFocus={!pendingInvitation}
              maxLength={50}
              placeholder="例如：樂樂"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            <span>出生日期 <small>選填</small></span>
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={busyAction !== null}
          >
            {busyAction === 'create' ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
            建立並開始記錄
          </button>
        </form>

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="text-button setup-signout" type="button" onClick={onSignOut}>
          登出這個帳戶
        </button>
      </section>
    </main>
  )
}

export function InviteDialog({
  open,
  busy,
  error,
  onAccept,
  onClose,
}: {
  open: boolean
  busy: boolean
  error: string
  onAccept: () => void
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card invite-confirmation" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <button className="modal-close" type="button" aria-label="關閉" onClick={onClose}>
          <X size={19} />
        </button>
        <span className="setup-icon purple"><QrCode size={27} /></span>
        <span className="eyebrow">A Little Star 邀請</span>
        <h2 id="invite-title">一起照顧這位孩子？</h2>
        <p>接受後，你和邀請者都可以查看及更新孩子的檔案、每日記錄和覆診筆記。</p>
        <button className="primary-button" type="button" disabled={busy} onClick={onAccept}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <UserPlus size={18} />}
          接受共同管理邀請
        </button>
        <button className="secondary-button" type="button" disabled={busy} onClick={onClose}>
          稍後再處理
        </button>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </section>
    </div>
  )
}
