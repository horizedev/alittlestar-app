import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Check,
  ClipboardList,
  HeartHandshake,
  LoaderCircle,
  LockKeyhole,
  Mail,
  NotebookPen,
  Pill,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react'

export function LandingPage({
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
    <div className="landing-page" id="top">
      <a className="skip-link" href="#landing-main">跳到主要內容</a>

      <header className="landing-header">
        <nav className="landing-nav" aria-label="主要導覽">
          <a className="landing-brand" href="#top" aria-label="A Little Star 首頁">
            <span className="brand-mark" aria-hidden="true">
              <Star size={21} fill="currentColor" />
            </span>
            <span translate="no">A Little Star</span>
          </a>
          <div className="landing-nav-links">
            <a href="#features">主要功能</a>
            <a href="#how-it-works">使用方法</a>
            <a href="#privacy">資料安全</a>
          </div>
          <a className="landing-nav-cta" href="#start">
            免費開始 <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="landing-main">
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-kicker">
              <Sparkles size={15} aria-hidden="true" />
              為在意每個小變化的家庭而設
            </div>
            <h1 id="hero-title">
              孩子的每一天，
              <span>值得被好好記住。</span>
            </h1>
            <p>
              輕鬆記錄服藥、睡眠、情緒與生活狀況，讓家人同步同行，
              也讓每次覆診都有清晰線索。
            </p>

            <div className="hero-benefits" aria-label="產品重點">
              <span><Check size={16} aria-hidden="true" /> 每日約 2 分鐘</span>
              <span><Check size={16} aria-hidden="true" /> 全繁體中文</span>
              <span><Check size={16} aria-hidden="true" /> 家庭共同管理</span>
            </div>

            <section className="hero-signin" id="start" aria-labelledby="signin-title">
              {hasInvitation ? (
                <div className="landing-invite-notice">
                  <QrCode size={20} aria-hidden="true" />
                  <div>
                    <strong>你收到共同管理邀請</strong>
                    <span>用電郵登入後，即可確認加入孩子的照顧團隊。</span>
                  </div>
                </div>
              ) : null}

              <div className="signin-heading">
                <span className="eyebrow">{hasInvitation ? '接受邀請' : '免費開始使用'}</span>
                <h2 id="signin-title">
                  {hasInvitation ? '登入並加入照顧團隊' : '一封電郵，立即開始'}
                </h2>
              </div>

              {sent ? (
                <div className="email-sent landing-email-sent" aria-live="polite">
                  <span><Mail size={23} aria-hidden="true" /></span>
                  <div>
                    <strong>登入連結已寄出</strong>
                    <p>請到 {email} 開啟郵件內的連結，完成後會自動返回。</p>
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
                <form className="landing-email-form" onSubmit={signIn}>
                  <label htmlFor="landing-email">電郵地址</label>
                  <div className="landing-email-row">
                    <div className="landing-email-input">
                      <Mail size={19} aria-hidden="true" />
                      <input
                        id="landing-email"
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
                    <button className="primary-button" type="submit" disabled={busy}>
                      {busy ? (
                        <LoaderCircle className="spin" size={19} aria-hidden="true" />
                      ) : (
                        <Send size={18} aria-hidden="true" />
                      )}
                      {busy ? '正在寄出…' : '寄送登入連結'}
                    </button>
                  </div>
                  <small>
                    毋須密碼。登入即表示你同意妥善保管孩子的敏感資料。
                  </small>
                </form>
              )}

              {error ? <p className="form-error" role="alert">{error}</p> : null}
            </section>
          </div>

          <ProductPreview />
        </section>

        <section className="landing-value-strip" aria-label="產品特色摘要">
          <div>
            <span><CalendarCheck2 size={20} aria-hidden="true" /></span>
            <p><strong>每日約 2 分鐘</strong>點選即可完成記錄</p>
          </div>
          <div>
            <span><UsersRound size={20} aria-hidden="true" /></span>
            <p><strong>家人同步同行</strong>不再各自保存零散資料</p>
          </div>
          <div>
            <span><ShieldCheck size={20} aria-hidden="true" /></span>
            <p><strong>私密而安全</strong>只有獲邀成員可查看</p>
          </div>
        </section>

        <section className="landing-section features-section" id="features" aria-labelledby="features-title">
          <div className="section-intro">
            <span className="eyebrow">記錄少一點，理解多一點</span>
            <h2 id="features-title">照顧孩子需要的重點，都在這裡。</h2>
            <p>不追求複雜數據，只整理每天真正有助你了解孩子的資訊。</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card coral">
              <span className="feature-icon"><Pill size={23} aria-hidden="true" /></span>
              <h3>2 分鐘完成每日記錄</h3>
              <p>用簡單選項記下服藥、專注力、飲食、睡眠與情緒，不用每天寫長篇日誌。</p>
              <span className="feature-detail">自動儲存 · 隨時補記</span>
            </article>
            <article className="feature-card green">
              <span className="feature-icon"><HeartHandshake size={23} aria-hidden="true" /></span>
              <h3>一家人看見同一個孩子</h3>
              <p>父母和照顧者共同更新記錄，減少重複追問，也不會遺漏另一半觀察到的細節。</p>
              <span className="feature-detail">QR 邀請 · 多孩子切換</span>
            </article>
            <article className="feature-card blue">
              <span className="feature-icon"><NotebookPen size={23} aria-hidden="true" /></span>
              <h3>想到便記低覆診問題</h3>
              <p>平日出現疑問時立即加入清單，下次見醫生前逐項整理，不再臨時回想。</p>
              <span className="feature-detail">待討論清單 · 完成標記</span>
            </article>
            <article className="feature-card purple">
              <span className="feature-icon"><BarChart3 size={23} aria-hidden="true" /></span>
              <h3>從日常看見變化趨勢</h3>
              <p>把零散印象變成連續記錄，更容易理解服藥、睡眠和情緒之間的關係。</p>
              <span className="feature-detail">7 日摘要 · 清晰歷史</span>
            </article>
          </div>
        </section>

        <section className="landing-section workflow-section" id="how-it-works" aria-labelledby="workflow-title">
          <div className="section-intro centered">
            <span className="eyebrow">簡單開始</span>
            <h2 id="workflow-title">3 步，建立家庭共同記錄。</h2>
          </div>
          <ol className="workflow-list">
            <li>
              <span className="workflow-number">1</span>
              <div>
                <Mail size={23} aria-hidden="true" />
                <h3>用電郵登入</h3>
                <p>毋須記密碼，開啟登入連結即可安全進入。</p>
              </div>
            </li>
            <li>
              <span className="workflow-number">2</span>
              <div>
                <QrCode size={23} aria-hidden="true" />
                <h3>建立孩子或掃描邀請</h3>
                <p>建立自己的孩子檔案，或掃描家人分享的 QR 圖碼加入。</p>
              </div>
            </li>
            <li>
              <span className="workflow-number">3</span>
              <div>
                <Sparkles size={23} aria-hidden="true" />
                <h3>每天一起記錄</h3>
                <p>每位照顧者看到相同資料，隨時補充自己的觀察。</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="landing-section collaboration-section" aria-labelledby="collaboration-title">
          <div className="collaboration-visual" aria-hidden="true">
            <div className="qr-card">
              <span><QrCode size={104} /></span>
              <strong>邀請共同管理</strong>
              <small>一次性邀請 · 24 小時有效</small>
            </div>
            <div className="family-bubbles">
              <span>媽</span>
              <span>爸</span>
              <span>姨</span>
            </div>
          </div>
          <div className="collaboration-copy">
            <span className="eyebrow">一起照顧，彼此安心</span>
            <h2 id="collaboration-title">孩子不是由一個人獨自照顧。</h2>
            <p>
              產生一次性 QR 圖碼，讓值得信任的家人加入。大家可以共同查看和更新，
              而未獲邀的人無法存取孩子資料。
            </p>
            <ul>
              <li><Check size={17} aria-hidden="true" /> 邀請只可使用 1 次</li>
              <li><Check size={17} aria-hidden="true" /> 24 小時後自動失效</li>
              <li><Check size={17} aria-hidden="true" /> 每個家庭的資料分開保存</li>
            </ul>
          </div>
        </section>

        <section className="landing-section privacy-section" id="privacy" aria-labelledby="privacy-title">
          <div className="privacy-copy">
            <span className="privacy-icon"><LockKeyhole size={28} aria-hidden="true" /></span>
            <span className="eyebrow">私隱由設計開始</span>
            <h2 id="privacy-title">孩子的資料，只屬於你們的家庭。</h2>
            <p>
              所有孩子檔案、每日記錄和覆診筆記均設有逐筆存取權限。
              只有已登入及獲邀的照顧者，才可以查看或更新相關內容。
            </p>
          </div>
          <div className="privacy-points">
            <article>
              <ShieldCheck size={22} aria-hidden="true" />
              <div><strong>逐筆權限保護</strong><span>資料庫層面阻止跨家庭存取</span></div>
            </article>
            <article>
              <Mail size={22} aria-hidden="true" />
              <div><strong>免密碼登入</strong><span>登入連結直接寄到你的電郵</span></div>
            </article>
            <article>
              <QrCode size={22} aria-hidden="true" />
              <div><strong>安全邀請</strong><span>邀請碼只保存不可逆雜湊</span></div>
            </article>
          </div>
        </section>

        <section className="landing-final-cta" aria-labelledby="final-cta-title">
          <span className="brand-mark large" aria-hidden="true">
            <Star size={29} fill="currentColor" />
          </span>
          <h2 id="final-cta-title">從今天開始，更了解孩子一點。</h2>
          <p>不用準備，不用學習複雜工具。用一封電郵，建立第一份記錄。</p>
          <a className="final-cta-button" href="#start">
            免費開始使用 <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <Star size={19} fill="currentColor" />
          </span>
          <span translate="no">A Little Star</span>
        </a>
        <p>陪伴家庭記錄孩子每天的小變化。</p>
        <span>© {new Date().getFullYear()} A Little Star</span>
      </footer>
    </div>
  )
}

function ProductPreview() {
  const previewDate = new Intl.DateTimeFormat('zh-HK', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())

  return (
    <div className="hero-product" aria-hidden="true">
      <div className="product-glow" />
      <div className="product-window">
        <div className="product-topbar">
          <div className="product-brand">
            <span><Star size={14} fill="currentColor" /></span>
            <strong>A Little Star</strong>
          </div>
          <div className="product-child">
            <span>樂</span>
            <strong>樂樂</strong>
          </div>
        </div>
        <div className="product-body">
          <div className="product-date">
            <span>‹</span>
            <div><small>今天</small><strong>{previewDate}</strong></div>
            <span>›</span>
          </div>
          <div className="product-progress">
            <div className="preview-ring"><span>72%</span></div>
            <div>
              <small>今日記錄</small>
              <strong>輕鬆記下孩子的狀況</strong>
              <p>所有變更已同步給家庭成員</p>
            </div>
          </div>
          <div className="preview-card medication">
            <span className="preview-card-icon"><Pill size={17} /></span>
            <div className="preview-card-copy"><strong>服藥記錄</strong><small>今天有按時服藥嗎？</small></div>
            <span className="preview-chip selected"><Check size={11} /> 已服藥</span>
          </div>
          <div className="preview-card mood">
            <span className="preview-card-icon"><Sparkles size={17} /></span>
            <div className="preview-card-copy"><strong>日間表現</strong><small>回想今天大部分時間的狀態</small></div>
            <div className="preview-moods"><span>🙂</span><span className="active">😊</span><span>🌟</span></div>
          </div>
          <div className="preview-bottom-nav">
            <span className="active"><CalendarCheck2 size={14} />今日</span>
            <span><ClipboardList size={14} />記錄</span>
            <span><BarChart3 size={14} />趨勢</span>
            <span><NotebookPen size={14} />覆診</span>
          </div>
        </div>
      </div>
      <div className="floating-note">
        <span><UsersRound size={17} /></span>
        <div><strong>家庭同步</strong><small>剛剛更新</small></div>
        <Check size={15} />
      </div>
    </div>
  )
}
