import { useEffect, useState, type FormEvent } from 'react'
import {
  Baby,
  Check,
  ChevronRight,
  Clipboard,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  QrCode,
  Share2,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from './supabase'
import type { Child, ChildRole } from './types'

export function ChildMenu({
  open,
  children,
  currentChild,
  roles,
  userEmail,
  onClose,
  onSelect,
  onCreate,
  onUpdate,
  onSignOut,
}: {
  open: boolean
  children: Child[]
  currentChild: Child
  roles: Record<string, ChildRole>
  userEmail: string
  onClose: () => void
  onSelect: (childId: string) => void
  onCreate: (name: string, birthDate: string | null) => Promise<string | null>
  onUpdate: (
    childId: string,
    name: string,
    birthDate: string | null,
  ) => Promise<string | null>
  onSignOut: () => Promise<void>
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [editName, setEditName] = useState(currentChild.name)
  const [editBirthDate, setEditBirthDate] = useState(
    currentChild.birthDate ?? '',
  )
  const [inviteUrl, setInviteUrl] = useState('')
  const [busy, setBusy] = useState<'create' | 'update' | 'invite' | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setInviteUrl('')
    setCopied(false)
    setError('')
    setEditName(currentChild.name)
    setEditBirthDate(currentChild.birthDate ?? '')
    setShowEdit(false)
  }, [currentChild.birthDate, currentChild.id, currentChild.name])

  if (!open) {
    return null
  }

  const createChild = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('請輸入孩子的稱呼。')
      return
    }

    setBusy('create')
    setError('')
    const message = await onCreate(trimmedName, birthDate || null)
    if (message) {
      setError(message)
      setBusy(null)
      return
    }

    setName('')
    setBirthDate('')
    setShowCreate(false)
    setBusy(null)
  }

  const createInvitation = async () => {
    setBusy('invite')
    setError('')
    setInviteUrl('')
    const { data, error: inviteError } = await supabase.rpc(
      'create_child_invite',
      { p_child_id: currentChild.id },
    )

    if (inviteError || !data) {
      setError('未能建立邀請，請稍後再試。只有檔案建立者可發出邀請。')
      setBusy(null)
      return
    }

    setInviteUrl(`${window.location.origin}/?invite=${encodeURIComponent(data)}`)
    setBusy(null)
  }

  const updateChild = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = editName.trim()
    if (!trimmedName) {
      setError('請輸入孩子的稱呼。')
      return
    }

    setBusy('update')
    setError('')
    const message = await onUpdate(
      currentChild.id,
      trimmedName,
      editBirthDate || null,
    )
    if (message) {
      setError(message)
      setBusy(null)
      return
    }

    setShowEdit(false)
    setBusy(null)
  }

  const copyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
    } catch {
      setError('未能自動複製，請長按連結手動複製。')
    }
  }

  const shareInvitation = async () => {
    if (!navigator.share) {
      await copyInvitation()
      return
    }

    try {
      await navigator.share({
        title: `共同管理 ${currentChild.name} 的檔案`,
        text: '請使用這個一次性邀請加入童步 Childsteps。',
        url: inviteUrl,
      })
    } catch {
      // Closing the native share sheet is not an error the user needs to see.
    }
  }

  const currentRole = roles[currentChild.id]

  return (
    <div className="modal-backdrop align-end" role="presentation">
      <section className="modal-card child-menu-card" role="dialog" aria-modal="true" aria-labelledby="child-menu-title">
        <button className="modal-close" type="button" aria-label="關閉" onClick={onClose}>
          <X size={19} />
        </button>
        <div className="modal-heading">
          <span className="section-icon green"><UsersRound size={22} /></span>
          <div>
            <span className="eyebrow">家庭與孩子</span>
            <h2 id="child-menu-title">選擇孩子</h2>
          </div>
        </div>

        <div className="child-list">
          {children.map((child) => (
            <button
              type="button"
              className={child.id === currentChild.id ? 'active' : ''}
              onClick={() => onSelect(child.id)}
              key={child.id}
            >
              <span className="avatar">{child.name.slice(0, 1)}</span>
              <span>
                <strong>{child.name}</strong>
                <small>{roles[child.id] === 'owner' ? '你建立的檔案' : '共同管理'}</small>
              </span>
              {child.id === currentChild.id ? <Check size={18} /> : <ChevronRight size={18} />}
            </button>
          ))}
        </div>

        <button
          className="add-child-button"
          type="button"
          onClick={() => {
            setShowCreate((current) => !current)
            setShowEdit(false)
            setError('')
          }}
        >
          <Plus size={18} /> 加入另一位孩子
        </button>

        {showCreate ? (
          <form className="child-form compact" onSubmit={createChild}>
            <label>
              <span>孩子稱呼</span>
              <input
                autoFocus
                maxLength={50}
                placeholder="例如：星星"
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
            <button className="primary-button" type="submit" disabled={busy !== null}>
              {busy === 'create' ? <LoaderCircle className="spin" size={18} /> : <Baby size={18} />}
              建立孩子檔案
            </button>
          </form>
        ) : null}

        <button
          className="edit-child-button"
          type="button"
          onClick={() => {
            setShowEdit((current) => !current)
            setShowCreate(false)
            setError('')
          }}
        >
          <Pencil size={16} /> 編輯{currentChild.name}的基本資料
        </button>

        {showEdit ? (
          <form className="child-form compact" onSubmit={updateChild}>
            <label>
              <span>孩子稱呼</span>
              <input
                autoFocus
                maxLength={50}
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />
            </label>
            <label>
              <span>出生日期 <small>選填</small></span>
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={editBirthDate}
                onChange={(event) => setEditBirthDate(event.target.value)}
              />
            </label>
            <button className="primary-button" type="submit" disabled={busy !== null}>
              {busy === 'update' ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}
              儲存基本資料
            </button>
          </form>
        ) : null}

        <div className="menu-divider" />

        <section className="share-section">
          <div className="share-heading">
            <span className="section-icon purple"><QrCode size={21} /></span>
            <div>
              <strong>邀請家人共同管理</strong>
              <span>目前選擇：{currentChild.name}</span>
            </div>
          </div>

          {currentRole === 'owner' ? (
            inviteUrl ? (
              <div className="qr-invite">
                <div className="qr-frame">
                  <QRCodeSVG value={inviteUrl} size={184} level="M" />
                </div>
                <strong>請家人用手機相機掃描</strong>
                <p>邀請只可使用一次，並會在 24 小時後失效。</p>
                <a href={inviteUrl}>{inviteUrl}</a>
                <div className="invite-actions">
                  <button className="secondary-button" type="button" onClick={copyInvitation}>
                    {copied ? <Check size={17} /> : <Clipboard size={17} />}
                    {copied ? '已複製' : '複製連結'}
                  </button>
                  <button className="primary-button" type="button" onClick={shareInvitation}>
                    <Share2 size={17} /> 分享
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="invite-button"
                type="button"
                disabled={busy !== null}
                onClick={createInvitation}
              >
                {busy === 'invite' ? <LoaderCircle className="spin" size={20} /> : <QrCode size={20} />}
                <span>
                  <strong>產生一次性 QR code</strong>
                  <small>新 QR code 會令上一個邀請失效</small>
                </span>
              </button>
            )
          ) : (
            <div className="permission-note">
              <ShieldCheck size={19} />
              <span>只有建立這個檔案的人可邀請其他共同管理者。</span>
            </div>
          )}
        </section>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <footer className="account-footer">
          <div className="account-footer-meta">
            <span>{userEmail}</span>
            <a href="mailto:support@childsteps.fit">支援：support@childsteps.fit</a>
          </div>
          <button type="button" onClick={onSignOut}>
            <LogOut size={16} /> 登出
          </button>
        </footer>
      </section>
    </div>
  )
}
