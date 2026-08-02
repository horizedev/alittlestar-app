import { useState, type FormEvent } from 'react'
import {
  Baby,
  LoaderCircle,
  Mail,
  QrCode,
  Send,
  ShieldCheck,
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

export function AuthScreen({
  hasInvitation,
  onSignIn,
}: {
  hasInvitation: boolean
  onSignIn: (email: string) => Promise<string | null>
}) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const signIn = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const message = await onSignIn(email.trim())
    if (message) {
      setError(message)
    } else {
      setSent(true)
    }
    setBusy(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark large">
            <Star size={29} fill="currentColor" />
          </span>
          <span>A Little Star</span>
        </div>
        <span className="eyebrow">陪伴孩子，每天多了解一點</span>
        <h1>把每日的小變化，連成成長的軌跡</h1>
        <p className="auth-intro">
          與家人一起記錄孩子的服藥、睡眠、情緒和生活狀況，覆診時更容易整理重點。
        </p>

        {hasInvitation ? (
          <div className="invitation-notice">
            <QrCode size={20} />
            <div>
              <strong>你收到共同管理邀請</strong>
              <span>登入後即可確認加入孩子的照顧團隊。</span>
            </div>
          </div>
        ) : null}

        {sent ? (
          <div className="email-sent" aria-live="polite">
            <span><Mail size={23} /></span>
            <div>
              <strong>登入連結已寄出</strong>
              <p>請到 {email} 開啟郵件內的連結。完成後會自動返回 A Little Star。</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setSent(false)
                setError('')
              }}
            >
              使用另一個電郵地址
            </button>
          </div>
        ) : (
          <form className="email-auth-form" onSubmit={signIn}>
            <label htmlFor="login-email">電郵地址</label>
            <div>
              <Mail size={19} />
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={19} /> : <Send size={18} />}
              {busy ? '正在寄出…' : '寄送登入連結'}
            </button>
            <small>毋須密碼；新用戶會在驗證電郵後自動建立帳戶。</small>
          </form>
        )}

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <div className="auth-assurances">
          <span><ShieldCheck size={16} /> 每個家庭的資料分開保存</span>
          <span><Sparkles size={16} /> 免費開始，約一分鐘完成</span>
        </div>
      </section>
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
