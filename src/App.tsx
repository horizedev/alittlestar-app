import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Droplets,
  Heart,
  History,
  Minus,
  MoonStar,
  NotebookPen,
  Pill,
  Plus,
  Save,
  Sparkles,
  Sun,
  Utensils,
} from 'lucide-react'

type Tab = 'today' | 'history' | 'trends'
type Choice = string | null

type DailyRecord = {
  medicineTaken: boolean | null
  medicineTime: string
  dose: string
  focus: Choice
  impulse: Choice
  calm: Choice
  effectMinutes: Choice
  durationHours: Choice
  sleepQuality: Choice
  bedtime: string
  wakeTime: string
  sideEffects: string[]
  meals: Record<string, Choice>
  water: number
  moods: string[]
  meltdowns: number
  eyeContact: Choice
  socialDistance: Choice
  bodyContact: Choice
  sensory: string[]
  notes: string
  updatedAt: number
}

const STORAGE_KEY = 'daybyday-records-v1'

const createEmptyRecord = (): DailyRecord => ({
  medicineTaken: null,
  medicineTime: '',
  dose: '',
  focus: null,
  impulse: null,
  calm: null,
  effectMinutes: null,
  durationHours: null,
  sleepQuality: null,
  bedtime: '',
  wakeTime: '',
  sideEffects: [],
  meals: { 早餐: null, 午餐: null, 晚餐: null, 小食: null },
  water: 0,
  moods: [],
  meltdowns: 0,
  eyeContact: null,
  socialDistance: null,
  bodyContact: null,
  sensory: [],
  notes: '',
  updatedAt: Date.now(),
})

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function shiftDate(key: string, amount: number) {
  const date = dateFromKey(key)
  date.setDate(date.getDate() + amount)
  return localDateKey(date)
}

function formatDate(key: string, includeYear = false) {
  return new Intl.DateTimeFormat('zh-HK', {
    ...(includeYear ? { year: 'numeric' as const } : {}),
    month: includeYear ? 'long' : 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(dateFromKey(key))
}

function loadRecords(): Record<string, DailyRecord> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const focusOptions = [
  { value: '很差', emoji: '😣' },
  { value: '一般', emoji: '🙂' },
  { value: '良好', emoji: '😊' },
  { value: '極佳', emoji: '🌟' },
]

const threeLevelOptions = [
  { value: '需要留意', emoji: '😟' },
  { value: '一般', emoji: '🙂' },
  { value: '良好', emoji: '✨' },
]

const appetiteOptions = [
  { value: '沒有吃', emoji: '—' },
  { value: '少量', emoji: '◔' },
  { value: '正常', emoji: '◑' },
  { value: '吃得好', emoji: '●' },
]

const moodOptions = [
  { value: '愉快', emoji: '😄' },
  { value: '平靜', emoji: '😌' },
  { value: '焦躁', emoji: '😣' },
  { value: '忟憎', emoji: '😠' },
  { value: '易喊', emoji: '😢' },
]

function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [selectedDate, setSelectedDate] = useState(localDateKey)
  const [records, setRecords] = useState<Record<string, DailyRecord>>(loadRecords)
  const [showNotes, setShowNotes] = useState(false)
  const today = localDateKey()
  const record = records[selectedDate] ?? createEmptyRecord()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const updateRecord = (patch: Partial<DailyRecord>) => {
    setRecords((current) => ({
      ...current,
      [selectedDate]: {
        ...(current[selectedDate] ?? createEmptyRecord()),
        ...patch,
        updatedAt: Date.now(),
      },
    }))
  }

  const toggleList = (
    field: 'sideEffects' | 'moods' | 'sensory',
    value: string,
  ) => {
    const current = record[field]
    updateRecord({
      [field]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    })
  }

  const completion = useMemo(() => {
    const checks = [
      record.medicineTaken !== null,
      Boolean(record.focus && record.impulse && record.calm),
      Boolean(record.sleepQuality),
      Object.values(record.meals).some(Boolean),
      record.water > 0,
      record.moods.length > 0,
      Boolean(record.eyeContact && record.socialDistance),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [record])

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        {tab === 'today' ? (
          <>
            <DateNavigator
              date={selectedDate}
              today={today}
              onChange={setSelectedDate}
            />
            <ProgressCard completion={completion} date={selectedDate} today={today} />
            <div className="section-stack">
              <MedicationCard record={record} updateRecord={updateRecord} />
              <ObservationCard record={record} updateRecord={updateRecord} />
              <FoodCard record={record} updateRecord={updateRecord} />
              <SleepCard
                record={record}
                updateRecord={updateRecord}
                onToggle={(value) => toggleList('sideEffects', value)}
              />
              <MoodCard
                record={record}
                updateRecord={updateRecord}
                toggleList={toggleList}
              />
              <NotesCard
                record={record}
                show={showNotes}
                onShow={() => setShowNotes(true)}
                updateRecord={updateRecord}
              />
            </div>
          </>
        ) : null}
        {tab === 'history' ? (
          <HistoryView
            records={records}
            onOpen={(date) => {
              setSelectedDate(date)
              setTab('today')
            }}
          />
        ) : null}
        {tab === 'trends' ? <TrendsView records={records} /> : null}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}

function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Sun size={22} strokeWidth={2.2} />
          </span>
          <div>
            <strong>日日伴</strong>
            <span>每天多了解一點</span>
          </div>
        </div>
        <button className="child-switcher" type="button" aria-label="選擇孩子">
          <span className="avatar">樂</span>
          <span>樂樂</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  )
}

function DateNavigator({
  date,
  today,
  onChange,
}: {
  date: string
  today: string
  onChange: (date: string) => void
}) {
  const isToday = date === today
  return (
    <div className="date-nav">
      <button
        className="icon-button"
        type="button"
        aria-label="前一天"
        onClick={() => onChange(shiftDate(date, -1))}
      >
        <ChevronLeft size={21} />
      </button>
      <button
        className="date-button"
        type="button"
        onClick={() => onChange(today)}
        aria-label="返回今天"
      >
        <span>{isToday ? '今天' : formatDate(date, true)}</span>
        <strong>{isToday ? formatDate(date) : '按此返回今天'}</strong>
      </button>
      <button
        className="icon-button"
        type="button"
        aria-label="後一天"
        disabled={isToday}
        onClick={() => onChange(shiftDate(date, 1))}
      >
        <ChevronRight size={21} />
      </button>
    </div>
  )
}

function ProgressCard({
  completion,
  date,
  today,
}: {
  completion: number
  date: string
  today: string
}) {
  return (
    <section className="progress-card">
      <div className="progress-ring" style={{ '--progress': `${completion * 3.6}deg` } as React.CSSProperties}>
        <span>{completion}%</span>
      </div>
      <div className="progress-copy">
        <span className="eyebrow">{date === today ? '今日記錄' : '當日記錄'}</span>
        <h1>{completion === 100 ? '今天記錄完成了！' : '輕鬆記下孩子的狀況'}</h1>
        <p>{completion === 0 ? '每項只需幾個點選，約 2 分鐘完成。' : '所有變更已自動儲存在這部裝置。'}</p>
      </div>
      <span className="save-status">
        <Save size={15} /> 自動儲存
      </span>
    </section>
  )
}

function SectionCard({
  icon,
  title,
  subtitle,
  tone,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  tone: string
  children: React.ReactNode
}) {
  return (
    <section className="section-card">
      <div className="section-heading">
        <span className={`section-icon ${tone}`}>{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: string; emoji?: string }>
  value: Choice
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="question-group">
      <legend>{label}</legend>
      <div className={`choice-grid columns-${Math.min(options.length, 4)}`}>
        {options.map((option) => (
          <button
            type="button"
            className={`choice-button ${value === option.value ? 'selected' : ''}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            key={option.value}
          >
            {option.emoji ? <span aria-hidden="true">{option.emoji}</span> : null}
            <strong>{option.value}</strong>
            {value === option.value ? <Check className="choice-check" size={15} /> : null}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function MedicationCard({
  record,
  updateRecord,
}: {
  record: DailyRecord
  updateRecord: (patch: Partial<DailyRecord>) => void
}) {
  return (
    <SectionCard
      icon={<Pill size={21} />}
      title="服藥記錄"
      subtitle="今天有按時服藥嗎？"
      tone="coral"
    >
      <div className="binary-choice">
        <button
          type="button"
          className={record.medicineTaken === true ? 'selected positive' : ''}
          onClick={() => updateRecord({ medicineTaken: true })}
        >
          <Check size={20} /> 已服藥
        </button>
        <button
          type="button"
          className={record.medicineTaken === false ? 'selected' : ''}
          onClick={() => updateRecord({ medicineTaken: false })}
        >
          今天沒有
        </button>
      </div>
      {record.medicineTaken ? (
        <div className="inline-fields reveal">
          <label>
            <span><Clock3 size={16} /> 服藥時間</span>
            <input
              type="time"
              value={record.medicineTime}
              onChange={(event) => updateRecord({ medicineTime: event.target.value })}
            />
          </label>
          <div className="compact-field">
            <span>劑量</span>
            <div className="mini-options">
              {['半粒', '1 粒', '1.5 粒'].map((dose) => (
                <button
                  type="button"
                  className={record.dose === dose ? 'selected' : ''}
                  onClick={() => updateRecord({ dose })}
                  key={dose}
                >
                  {dose}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </SectionCard>
  )
}

function ObservationCard({
  record,
  updateRecord,
}: {
  record: DailyRecord
  updateRecord: (patch: Partial<DailyRecord>) => void
}) {
  return (
    <SectionCard
      icon={<Sparkles size={21} />}
      title="日間表現"
      subtitle="回想孩子今天大部分時間的狀態"
      tone="yellow"
    >
      <ChoiceRow
        label="專注力"
        options={focusOptions}
        value={record.focus}
        onChange={(focus) => updateRecord({ focus })}
      />
      <ChoiceRow
        label="衝動控制"
        options={threeLevelOptions}
        value={record.impulse}
        onChange={(impulse) => updateRecord({ impulse })}
      />
      <ChoiceRow
        label="情緒平穩度"
        options={[
          { value: '起伏較大', emoji: '🌊' },
          { value: '大致平穩', emoji: '🌤️' },
          { value: '非常平靜', emoji: '🍃' },
        ]}
        value={record.calm}
        onChange={(calm) => updateRecord({ calm })}
      />
      <div className="split-questions">
        <ChoiceRow
          label="多久開始見效？"
          options={['30分鐘內', '約1小時', '不明顯'].map((value) => ({ value }))}
          value={record.effectMinutes}
          onChange={(effectMinutes) => updateRecord({ effectMinutes })}
        />
        <ChoiceRow
          label="藥效維持多久？"
          options={['半天', '放學前', '到傍晚'].map((value) => ({ value }))}
          value={record.durationHours}
          onChange={(durationHours) => updateRecord({ durationHours })}
        />
      </div>
    </SectionCard>
  )
}

function FoodCard({
  record,
  updateRecord,
}: {
  record: DailyRecord
  updateRecord: (patch: Partial<DailyRecord>) => void
}) {
  return (
    <SectionCard
      icon={<Utensils size={21} />}
      title="飲食與飲水"
      subtitle="不用寫餐單，記下大約食量便可以"
      tone="green"
    >
      <div className="meal-list">
        {Object.entries(record.meals).map(([meal, value]) => (
          <div className="meal-row" key={meal}>
            <strong>{meal}</strong>
            <div className="meal-options">
              {appetiteOptions.map((option) => (
                <button
                  type="button"
                  className={value === option.value ? 'selected' : ''}
                  onClick={() =>
                    updateRecord({ meals: { ...record.meals, [meal]: option.value } })
                  }
                  aria-label={`${meal}：${option.value}`}
                  title={option.value}
                  key={option.value}
                >
                  <span aria-hidden="true">{option.emoji}</span>
                  <small>{option.value}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="stepper-row">
        <span className="section-icon blue"><Droplets size={20} /></span>
        <div>
          <strong>全日飲水量</strong>
          <span>每杯約 250 毫升</span>
        </div>
        <div className="stepper">
          <button
            type="button"
            aria-label="減少一杯水"
            disabled={record.water === 0}
            onClick={() => updateRecord({ water: Math.max(0, record.water - 1) })}
          >
            <Minus size={18} />
          </button>
          <strong>{record.water} <small>杯</small></strong>
          <button
            type="button"
            aria-label="增加一杯水"
            onClick={() => updateRecord({ water: record.water + 1 })}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

function SleepCard({
  record,
  updateRecord,
  onToggle,
}: {
  record: DailyRecord
  updateRecord: (patch: Partial<DailyRecord>) => void
  onToggle: (value: string) => void
}) {
  return (
    <SectionCard
      icon={<MoonStar size={21} />}
      title="睡眠與身體反應"
      subtitle="昨晚睡得好嗎？有沒有不舒服？"
      tone="purple"
    >
      <ChoiceRow
        label="睡眠質素"
        options={[
          { value: '難入睡', emoji: '😵‍💫' },
          { value: '易醒／多夢', emoji: '🌙' },
          { value: '安穩', emoji: '😴' },
          { value: '熟睡', emoji: '💤' },
        ]}
        value={record.sleepQuality}
        onChange={(sleepQuality) => updateRecord({ sleepQuality })}
      />
      <div className="inline-fields time-fields">
        <label>
          <span><MoonStar size={16} /> 入睡</span>
          <input
            type="time"
            value={record.bedtime}
            onChange={(event) => updateRecord({ bedtime: event.target.value })}
          />
        </label>
        <label>
          <span><Sun size={16} /> 起床</span>
          <input
            type="time"
            value={record.wakeTime}
            onChange={(event) => updateRecord({ wakeTime: event.target.value })}
          />
        </label>
      </div>
      <fieldset className="question-group">
        <legend>今天有以下反應嗎？（可多選）</legend>
        <div className="tag-options">
          {['沒有', '胃口差', '頭痛', '腸胃不適'].map((effect) => (
            <button
              type="button"
              className={record.sideEffects.includes(effect) ? 'selected' : ''}
              aria-pressed={record.sideEffects.includes(effect)}
              onClick={() => onToggle(effect)}
              key={effect}
            >
              {record.sideEffects.includes(effect) ? <Check size={15} /> : null}
              {effect}
            </button>
          ))}
        </div>
      </fieldset>
    </SectionCard>
  )
}

function MoodCard({
  record,
  updateRecord,
  toggleList,
}: {
  record: DailyRecord
  updateRecord: (patch: Partial<DailyRecord>) => void
  toggleList: (field: 'sideEffects' | 'moods' | 'sensory', value: string) => void
}) {
  return (
    <SectionCard
      icon={<Heart size={21} />}
      title="情緒、行為與社交"
      subtitle="可選多於一種最常出現的情緒"
      tone="pink"
    >
      <fieldset className="question-group">
        <legend>整體情緒</legend>
        <div className="mood-grid">
          {moodOptions.map((mood) => (
            <button
              type="button"
              className={record.moods.includes(mood.value) ? 'selected' : ''}
              aria-pressed={record.moods.includes(mood.value)}
              onClick={() => toggleList('moods', mood.value)}
              key={mood.value}
            >
              <span aria-hidden="true">{mood.emoji}</span>
              <strong>{mood.value}</strong>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="stepper-row compact">
        <span className="section-icon coral"><Activity size={20} /></span>
        <div>
          <strong>情緒爆發次數</strong>
          <span>{record.meltdowns === 0 ? '今天沒有，做得好' : '記下次數以觀察趨勢'}</span>
        </div>
        <div className="stepper">
          <button
            type="button"
            aria-label="減少一次"
            disabled={record.meltdowns === 0}
            onClick={() => updateRecord({ meltdowns: Math.max(0, record.meltdowns - 1) })}
          >
            <Minus size={18} />
          </button>
          <strong>{record.meltdowns}</strong>
          <button
            type="button"
            aria-label="增加一次"
            onClick={() => updateRecord({ meltdowns: record.meltdowns + 1 })}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="split-questions">
        <ChoiceRow
          label="眼神接觸"
          options={['很少', '有時', '經常'].map((value) => ({ value }))}
          value={record.eyeContact}
          onChange={(eyeContact) => updateRecord({ eyeContact })}
        />
        <ChoiceRow
          label="社交距離"
          options={['太近', '適當', '太遠'].map((value) => ({ value }))}
          value={record.socialDistance}
          onChange={(socialDistance) => updateRecord({ socialDistance })}
        />
      </div>
      <ChoiceRow
        label="不恰當身體接觸"
        options={['沒有', '偶爾', '多次'].map((value) => ({ value }))}
        value={record.bodyContact}
        onChange={(bodyContact) => updateRecord({ bodyContact })}
      />
      <fieldset className="question-group">
        <legend>感官／固着行為（可多選）</legend>
        <div className="tag-options">
          {['沒有', '怕聲音', '怕觸感', '重複動作', '固執堅持'].map((item) => (
            <button
              type="button"
              className={record.sensory.includes(item) ? 'selected' : ''}
              aria-pressed={record.sensory.includes(item)}
              onClick={() => toggleList('sensory', item)}
              key={item}
            >
              {record.sensory.includes(item) ? <Check size={15} /> : null}
              {item}
            </button>
          ))}
        </div>
      </fieldset>
    </SectionCard>
  )
}

function NotesCard({
  record,
  show,
  onShow,
  updateRecord,
}: {
  record: DailyRecord
  show: boolean
  onShow: () => void
  updateRecord: (patch: Partial<DailyRecord>) => void
}) {
  if (!show && !record.notes) {
    return (
      <button className="add-notes" type="button" onClick={onShow}>
        <span className="section-icon neutral"><NotebookPen size={20} /></span>
        <span>
          <strong>有其他事情想記下嗎？</strong>
          <small>選填，例如特別事件或醫生囑咐</small>
        </span>
        <Plus size={20} />
      </button>
    )
  }
  return (
    <SectionCard
      icon={<NotebookPen size={21} />}
      title="其他備註"
      subtitle="選填，可用語音輸入減少打字"
      tone="neutral"
    >
      <textarea
        value={record.notes}
        onChange={(event) => updateRecord({ notes: event.target.value })}
        placeholder="例如：今天學校旅行，午餐比平日少……"
        rows={4}
      />
    </SectionCard>
  )
}

function HistoryView({
  records,
  onOpen,
}: {
  records: Record<string, DailyRecord>
  onOpen: (date: string) => void
}) {
  const entries = Object.entries(records).sort(([a], [b]) => b.localeCompare(a))
  return (
    <div className="page-view">
      <div className="page-heading">
        <span className="section-icon green"><History size={22} /></span>
        <div>
          <span className="eyebrow">過往記錄</span>
          <h1>每天的足跡</h1>
          <p>按日期查看當天的詳細觀察。</p>
        </div>
      </div>
      {entries.length ? (
        <div className="history-list">
          {entries.map(([date, item]) => (
            <button type="button" onClick={() => onOpen(date)} key={date}>
              <span className="history-date">
                <strong>{dateFromKey(date).getDate()}</strong>
                <small>{dateFromKey(date).toLocaleDateString('zh-HK', { month: 'short' })}</small>
              </span>
              <span className="history-copy">
                <strong>{formatDate(date)}</strong>
                <small>
                  {item.medicineTaken ? `已服藥 ${item.medicineTime || ''}` : '未標記服藥'}
                  {item.focus ? ` · 專注力${item.focus}` : ''}
                </small>
              </span>
              <span className={`status-dot ${item.medicineTaken ? 'done' : ''}`} />
              <ChevronRight size={19} />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays size={28} />}
          title="還未有過往記錄"
          text="完成今天的記錄後，便會在這裡看到。"
        />
      )}
    </div>
  )
}

function TrendsView({ records }: { records: Record<string, DailyRecord> }) {
  const days = Array.from({ length: 7 }, (_, index) =>
    shiftDate(localDateKey(), index - 6),
  )
  const completedDays = days.filter((day) => records[day]).length
  const medicineDays = days.filter((day) => records[day]?.medicineTaken).length
  return (
    <div className="page-view">
      <div className="page-heading">
        <span className="section-icon purple"><BarChart3 size={22} /></span>
        <div>
          <span className="eyebrow">最近 7 天</span>
          <h1>一眼看懂趨勢</h1>
          <p>持續記錄一星期後，趨勢會更有參考價值。</p>
        </div>
      </div>
      <div className="summary-grid">
        <article>
          <span><CalendarDays size={18} /> 已記錄</span>
          <strong>{completedDays}<small> / 7 天</small></strong>
        </article>
        <article>
          <span><Pill size={18} /> 已服藥</span>
          <strong>{medicineDays}<small> 天</small></strong>
        </article>
      </div>
      <section className="trend-card">
        <div className="trend-title">
          <div>
            <h2>專注力</h2>
            <p>最近一星期的每日評分</p>
          </div>
          <span className="legend"><i /> 已記錄</span>
        </div>
        <div className="bar-chart">
          {days.map((day) => {
            const score = { 很差: 1, 一般: 2, 良好: 3, 極佳: 4 }[
              records[day]?.focus ?? ''
            ] ?? 0
            return (
              <div className="bar-column" key={day}>
                <div className="bar-track">
                  <span style={{ height: `${score * 25}%` }} />
                </div>
                <small>
                  {dateFromKey(day).toLocaleDateString('zh-HK', { weekday: 'narrow' })}
                </small>
              </div>
            )
          })}
        </div>
      </section>
      {completedDays < 3 ? (
        <div className="insight-note">
          <Sparkles size={20} />
          <div>
            <strong>小提示</strong>
            <p>記錄至少 3 天後，我們便能開始整理情緒、睡眠與食慾的變化。</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function BottomNav({
  tab,
  onChange,
}: {
  tab: Tab
  onChange: (tab: Tab) => void
}) {
  const items = [
    { value: 'today' as const, label: '今日', icon: <CircleUserRound size={21} /> },
    { value: 'history' as const, label: '記錄', icon: <CalendarDays size={21} /> },
    { value: 'trends' as const, label: '趨勢', icon: <BarChart3 size={21} /> },
  ]
  return (
    <nav className="bottom-nav" aria-label="主要選單">
      <div>
        {items.map((item) => (
          <button
            type="button"
            className={tab === item.value ? 'active' : ''}
            aria-current={tab === item.value ? 'page' : undefined}
            onClick={() => onChange(item.value)}
            key={item.value}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default App
