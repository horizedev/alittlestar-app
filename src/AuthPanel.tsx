import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  QrCode,
  UserPlus,
} from 'lucide-react'

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset'

type AuthPanelProps = {
  hasInvitation: boolean
  recoveryMode: boolean
  onSignIn: (email: string, password: string) => Promise<string | null>
  onSignUp: (email: string, password: string) => Promise<string | null>
  onForgotPassword: (email: string) => Promise<string | null>
  onUpdatePassword: (password: string) => Promise<string | null>
}

export function AuthPanel({
  hasInvitation,
  recoveryMode,
  onSignIn,
  onSignUp,
  onForgotPassword,
  onUpdatePassword,
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>(
    recoveryMode ? 'reset' : 'signin',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const activeMode = recoveryMode ? 'reset' : mode

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    const trimmedEmail = email.trim()

    if (activeMode === 'forgot') {
      if (!trimmedEmail) {
        setError('請輸入電郵地址。')
        setBusy(false)
        return
      }
      const message = await onForgotPassword(trimmedEmail)
      if (message) {
        setError(message)
      } else {
        setNotice(`重設密碼連結已寄到 ${trimmedEmail}。請開啟郵件完成設定。`)
      }
      setBusy(false)
      return
    }

    if (activeMode === 'reset') {
      if (password.length < 8) {
        setError('新密碼至少需要 8 個字元。')
        setBusy(false)
        return
      }
      if (password !== confirmPassword) {
        setError('兩次輸入的密碼不一致。')
        setBusy(false)
        return
      }
      const message = await onUpdatePassword(password)
      if (message) {
        setError(message)
      }
      setBusy(false)
      return
    }

    if (!trimmedEmail || !password) {
      setError('請填寫電郵與密碼。')
      setBusy(false)
      return
    }

    if (activeMode === 'signup') {
      if (password.length < 8) {
        setError('密碼至少需要 8 個字元。')
        setBusy(false)
        return
      }
      if (password !== confirmPassword) {
        setError('兩次輸入的密碼不一致。')
        setBusy(false)
        return
      }
      const message = await onSignUp(trimmedEmail, password)
      if (message) {
        if (message.startsWith('NOTICE:')) {
          setNotice(message.slice(7))
          setPassword('')
          setConfirmPassword('')
        } else {
          setError(message)
        }
      }
      setBusy(false)
      return
    }

    const message = await onSignIn(trimmedEmail, password)
    if (message) {
      setError(message)
    }
    setBusy(false)
  }

  const titles: Record<AuthMode, { eyebrow: string; title: string }> = {
    signin: {
      eyebrow: hasInvitation ? '接受邀請' : '歡迎回來',
      title: hasInvitation ? '登入並加入照顧團隊' : '用電郵與密碼登入',
    },
    signup: {
      eyebrow: hasInvitation ? '接受邀請' : '免費開始使用',
      title: hasInvitation ? '建立帳戶並加入照顧團隊' : '建立你的家庭帳戶',
    },
    forgot: {
      eyebrow: '忘記密碼',
      title: '寄送重設密碼連結',
    },
    reset: {
      eyebrow: '重設密碼',
      title: '設定你的新密碼',
    },
  }

  const copy = titles[activeMode]

  return (
    <section className="hero-signin" id="start" aria-labelledby="signin-title">
      {hasInvitation && activeMode !== 'reset' ? (
        <div className="landing-invite-notice">
          <QrCode size={20} aria-hidden="true" />
          <div>
            <strong>你收到共同管理邀請</strong>
            <span>登入或註冊後，即可確認加入孩子的照顧團隊。</span>
          </div>
        </div>
      ) : null}

      <div className="signin-heading">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 id="signin-title">{copy.title}</h2>
      </div>

      {activeMode === 'signin' || activeMode === 'signup' ? (
        <div className="auth-mode-tabs" role="tablist" aria-label="登入方式">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'signin'}
            className={activeMode === 'signin' ? 'active' : ''}
            onClick={() => switchMode('signin')}
          >
            登入
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'signup'}
            className={activeMode === 'signup' ? 'active' : ''}
            onClick={() => switchMode('signup')}
          >
            註冊
          </button>
        </div>
      ) : null}

      {notice ? (
        <div className="email-sent landing-email-sent" aria-live="polite">
          <span><Mail size={23} aria-hidden="true" /></span>
          <div>
            <strong>已寄出郵件</strong>
            <p>{notice}</p>
          </div>
          {activeMode === 'forgot' ? (
            <button
              className="text-button"
              type="button"
              onClick={() => switchMode('signin')}
            >
              返回登入
            </button>
          ) : null}
        </div>
      ) : (
        <form className="landing-auth-form" onSubmit={submit}>
          {activeMode !== 'reset' ? (
            <label htmlFor="auth-email">
              電郵地址
              <div className="landing-email-input">
                <Mail size={19} aria-hidden="true" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  placeholder="例如：name@example.com…"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>
          ) : null}

          {activeMode !== 'forgot' ? (
            <label htmlFor="auth-password">
              {activeMode === 'reset' ? '新密碼' : '密碼'}
              <div className="landing-email-input">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    activeMode === 'signin' ? 'current-password' : 'new-password'
                  }
                  required
                  minLength={activeMode === 'signin' ? 1 : 8}
                  placeholder={
                    activeMode === 'signin' ? '輸入密碼…' : '至少 8 個字元…'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>
          ) : null}

          {activeMode === 'signup' || activeMode === 'reset' ? (
            <label htmlFor="auth-confirm-password">
              確認密碼
              <div className="landing-email-input">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="再輸入一次密碼…"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </label>
          ) : null}

          {activeMode === 'signin' ? (
            <div className="auth-form-meta">
              <button
                className="text-button auth-inline-link"
                type="button"
                onClick={() => switchMode('forgot')}
              >
                忘記密碼？
              </button>
            </div>
          ) : null}

          <button className="primary-button auth-submit" type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={19} aria-hidden="true" />
            ) : activeMode === 'signup' ? (
              <UserPlus size={18} aria-hidden="true" />
            ) : activeMode === 'forgot' ? (
              <Mail size={18} aria-hidden="true" />
            ) : activeMode === 'reset' ? (
              <KeyRound size={18} aria-hidden="true" />
            ) : (
              <ArrowRight size={18} aria-hidden="true" />
            )}
            {busy
              ? '處理中…'
              : activeMode === 'signup'
                ? '建立帳戶'
                : activeMode === 'forgot'
                  ? '寄送重設連結'
                  : activeMode === 'reset'
                    ? '更新密碼'
                    : '登入'}
          </button>

          <small>
            {activeMode === 'forgot'
              ? '我們會寄出一次性連結，讓你安全地重設密碼。'
              : activeMode === 'reset'
                ? '更新後會立即返回你的工作台。'
                : '登入即表示你同意妥善保管孩子的敏感資料。'}
          </small>
        </form>
      )}

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      {activeMode === 'forgot' && !notice ? (
        <button
          className="text-button auth-back-link"
          type="button"
          onClick={() => switchMode('signin')}
        >
          返回登入
        </button>
      ) : null}
    </section>
  )
}
