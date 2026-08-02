export type Tab = 'today' | 'history' | 'trends' | 'checkup'

export type Choice = string | null

export type DailyRecord = {
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

export type Child = {
  id: string
  name: string
  birthDate: string | null
  createdAt: string
}

export type ChildRole = 'owner' | 'caregiver'

export type CheckupNote = {
  id: string
  body: string
  isDone: boolean
  createdAt: string
  updatedAt: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
