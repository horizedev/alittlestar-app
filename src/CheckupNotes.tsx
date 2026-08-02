import { useEffect, useState, type FormEvent } from 'react'
import {
  Check,
  Circle,
  ClipboardList,
  LoaderCircle,
  Plus,
  Stethoscope,
  Trash2,
} from 'lucide-react'
import { supabase } from './supabase'
import type { CheckupNote, Child } from './types'

export function CheckupNotes({
  child,
  userId,
}: {
  child: Child
  userId: string
}) {
  const [notes, setNotes] = useState<CheckupNote[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadNotes = async () => {
      setLoading(true)
      setError('')
      const { data, error: loadError } = await supabase
        .from('checkup_notes')
        .select('*')
        .eq('child_id', child.id)
        .order('is_done', { ascending: true })
        .order('created_at', { ascending: false })

      if (!active) {
        return
      }

      if (loadError) {
        setError('未能載入覆診筆記，請重新整理後再試。')
        setLoading(false)
        return
      }

      setNotes(
        data.map((note) => ({
          id: note.id,
          body: note.body,
          isDone: note.is_done,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        })),
      )
      setLoading(false)
    }

    void loadNotes()
    return () => {
      active = false
    }
  }, [child.id])

  const addNote = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedBody = body.trim()
    if (!trimmedBody) {
      setError('請先寫下想在覆診時提出的事情。')
      return
    }

    setSaving(true)
    setError('')
    const { data, error: saveError } = await supabase
      .from('checkup_notes')
      .insert({
        child_id: child.id,
        body: trimmedBody,
        created_by: userId,
      })
      .select()
      .single()

    if (saveError) {
      setError('未能儲存筆記，請稍後再試。')
      setSaving(false)
      return
    }

    setNotes((current) => [
      {
        id: data.id,
        body: data.body,
        isDone: data.is_done,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      ...current,
    ])
    setBody('')
    setSaving(false)
  }

  const toggleNote = async (note: CheckupNote) => {
    const nextValue = !note.isDone
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id ? { ...item, isDone: nextValue } : item,
      ),
    )

    const { error: updateError } = await supabase
      .from('checkup_notes')
      .update({ is_done: nextValue })
      .eq('id', note.id)

    if (updateError) {
      setNotes((current) =>
        current.map((item) =>
          item.id === note.id ? { ...item, isDone: note.isDone } : item,
        ),
      )
      setError('未能更新筆記，請稍後再試。')
    }
  }

  const deleteNote = async (note: CheckupNote) => {
    if (!window.confirm('確定刪除這項覆診筆記？')) {
      return
    }

    const { error: deleteError } = await supabase
      .from('checkup_notes')
      .delete()
      .eq('id', note.id)

    if (deleteError) {
      setError('未能刪除筆記，請稍後再試。')
      return
    }

    setNotes((current) => current.filter((item) => item.id !== note.id))
  }

  const pendingCount = notes.filter((note) => !note.isDone).length

  return (
    <div className="page-view checkup-view">
      <div className="page-heading">
        <span className="section-icon blue"><Stethoscope size={22} /></span>
        <div>
          <span className="eyebrow">{child.name}的覆診準備</span>
          <h1>下次想問醫生甚麼？</h1>
          <p>有疑問時先記下，覆診前便不用靠記憶逐項回想。</p>
        </div>
      </div>

      <form className="checkup-composer" onSubmit={addNote}>
        <label htmlFor="checkup-note">新增覆診筆記</label>
        <textarea
          id="checkup-note"
          maxLength={2000}
          rows={4}
          placeholder="例如：最近午飯後胃口明顯較差，需要調整服藥時間嗎？"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <div>
          <small>{body.length} / 2000</small>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />}
            加入清單
          </button>
        </div>
      </form>

      {error ? <p className="form-error inline-error" role="alert">{error}</p> : null}

      <div className="checkup-summary">
        <span><ClipboardList size={18} /> 待討論事項</span>
        <strong>{pendingCount} 項</strong>
      </div>

      {loading ? (
        <div className="inline-loading">
          <LoaderCircle className="spin" size={22} /> 正在載入筆記…
        </div>
      ) : notes.length ? (
        <div className="checkup-list">
          {notes.map((note) => (
            <article className={note.isDone ? 'done' : ''} key={note.id}>
              <button
                className="note-check"
                type="button"
                aria-label={note.isDone ? '標示為待討論' : '標示為已討論'}
                onClick={() => void toggleNote(note)}
              >
                {note.isDone ? <Check size={18} /> : <Circle size={18} />}
              </button>
              <div>
                <p>{note.body}</p>
                <span>
                  {note.isDone ? '已討論' : '待討論'} ·{' '}
                  {new Intl.DateTimeFormat('zh-HK', {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(note.createdAt))}
                </span>
              </div>
              <button
                className="note-delete"
                type="button"
                aria-label="刪除筆記"
                onClick={() => void deleteNote(note)}
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state compact">
          <span><Stethoscope size={28} /></span>
          <h2>還未有覆診筆記</h2>
          <p>平日想起任何問題，隨手加到這裡便可以。</p>
        </div>
      )}
    </div>
  )
}
