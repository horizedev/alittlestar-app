import type { Database, Json } from './database.types'
import type { Choice, DailyRecord } from './types'

type DailyRecordRow = Database['public']['Tables']['daily_records']['Row']
type DailyRecordInsert = Database['public']['Tables']['daily_records']['Insert']

const defaultMeals: Record<string, Choice> = {
  早餐: null,
  午餐: null,
  晚餐: null,
  小食: null,
}

export const createEmptyRecord = (): DailyRecord => ({
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
  meals: { ...defaultMeals },
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

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function shiftDate(key: string, amount: number) {
  const date = dateFromKey(key)
  date.setDate(date.getDate() + amount)
  return localDateKey(date)
}

export function formatDate(key: string, includeYear = false) {
  return new Intl.DateTimeFormat('zh-HK', {
    ...(includeYear ? { year: 'numeric' as const } : {}),
    month: includeYear ? 'long' : 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(dateFromKey(key))
}

function normalizeTime(value: string | null) {
  return value ? value.slice(0, 5) : ''
}

function normalizeMeals(value: Json): Record<string, Choice> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return { ...defaultMeals }
  }

  const meals = { ...defaultMeals }
  for (const meal of Object.keys(meals)) {
    const choice = value[meal]
    meals[meal] = typeof choice === 'string' ? choice : null
  }
  return meals
}

export function dailyRecordFromRow(row: DailyRecordRow): DailyRecord {
  return {
    medicineTaken: row.medicine_taken,
    medicineTime: normalizeTime(row.medicine_time),
    dose: row.dose,
    focus: row.focus,
    impulse: row.impulse,
    calm: row.calm,
    effectMinutes: row.effect_minutes,
    durationHours: row.duration_hours,
    sleepQuality: row.sleep_quality,
    bedtime: normalizeTime(row.bedtime),
    wakeTime: normalizeTime(row.wake_time),
    sideEffects: row.side_effects,
    meals: normalizeMeals(row.meals),
    water: row.water,
    moods: row.moods,
    meltdowns: row.meltdowns,
    eyeContact: row.eye_contact,
    socialDistance: row.social_distance,
    bodyContact: row.body_contact,
    sensory: row.sensory,
    notes: row.notes,
    updatedAt: Date.parse(row.updated_at),
  }
}

export function dailyRecordToRow(
  childId: string,
  recordDate: string,
  record: DailyRecord,
  userId: string,
): DailyRecordInsert {
  return {
    child_id: childId,
    record_date: recordDate,
    medicine_taken: record.medicineTaken,
    medicine_time: record.medicineTime || null,
    dose: record.dose,
    focus: record.focus,
    impulse: record.impulse,
    calm: record.calm,
    effect_minutes: record.effectMinutes,
    duration_hours: record.durationHours,
    sleep_quality: record.sleepQuality,
    bedtime: record.bedtime || null,
    wake_time: record.wakeTime || null,
    side_effects: record.sideEffects,
    meals: record.meals,
    water: record.water,
    moods: record.moods,
    meltdowns: record.meltdowns,
    eye_contact: record.eyeContact,
    social_distance: record.socialDistance,
    body_contact: record.bodyContact,
    sensory: record.sensory,
    notes: record.notes,
    updated_by: userId,
  }
}
