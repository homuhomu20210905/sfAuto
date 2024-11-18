import dayjs from 'dayjs'

type WorkInfo = {
  date: dayjs.Dayjs
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  sleep: string
  description: string
  size: number
  workTime: () => number
  sleepMinute: () => number
  inputFlg: boolean
  visible: boolean
}
type ViewData = {
  date: dayjs.Dayjs
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  sleep: string
  description: string
  size: number
  workTime: () => number
  sleepMinute: () => number
  inputFlg: boolean
  visible: boolean
}

type OutputData = {
  date: string
  start: string
  end: string
  sleep: string
  description: string
  size: number
  inputFlg: boolean
  visible: boolean
}

export type { WorkInfo, ViewData, OutputData }
