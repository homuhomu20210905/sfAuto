import { ref, computed, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import SessionKey from '../assets/Constants'

export function useAboutView2() {
  const area = { value: '' }
  const datePick = ref([new Date(), new Date()])
  const sltWorkRate = ref('')
  const workRateNameList = [
    '現場対応／リモート',
    '現場対応／出社',
    '【承認済】ICT対応／出社',
    'リモート'
  ]

  const dateRanges = computed(() => {
    const startDate = datePick.value[0]
    const endDate = datePick.value[datePick.value.length - 1]
    return {
      startDate,
      endDate
    }
  })

  const datePickFormat = computed(() => {
    const date1 = datePick.value[0]
    const date2 = datePick.value[datePick.value.length - 1]
    return dayjs(date1).format('YYYY/MM/DD') + ' - ' + dayjs(date2).format('YYYY/MM/DD')
  })

  const createDayjs = (day: string, time: string) => {
    return dayjs(day + ' ' + time)
  }

  const days = computed(() => {
    const { startDate, endDate } = dateRanges.value
    const length = dayjs(endDate).diff(dayjs(startDate), 'day')
    const calcList = []
    for (let i = 0; i <= length; i++) {
      const date = dayjs(startDate).add(i, 'day').format('YYYY/MM/DD')
      const start = createDayjs(date, '09:30').format('HH:mm')
      const end = createDayjs(date, '18:30').format('HH:mm')
      const sleep = '1:00'
      const obj = {
        date,
        start,
        end,
        sleep,
        description: '',
        size: 5,
        inputFlg: false,
        visible: true
      }
      calcList.push(obj)
    }
    if (calcList.length !== 0) {
      sessionStorage.setItem(SessionKey.DAYS, JSON.stringify(calcList))
    } else {
      sessionStorage.removeItem(SessionKey.DAYS)
    }
    return calcList
  })

  const textList = reactive(days.value)

  const viewTextList = computed(() => {
    return textList.map((item) => {
      const obj = {
        date: dayjs(item.date),
        start: createDayjs(item.date, item.start),
        end: createDayjs(item.date, item.end),
        sleep: item.sleep,
        description: item.description,
        size: item.size,
        workTime: function () {
          const calcMinute = this.sleepMinute()
          return this.end.diff(this.start.add(calcMinute, 'm'), 'minutes') / 60
        },
        sleepMinute: function () {
          const [hour, minute] = this.sleep.split(':')
          return parseInt(hour) * 60 + parseInt(minute)
        },
        inputFlg: item.inputFlg,
        visible: item.visible
      }
      return obj
    })
  })

  const totalWorkTime = computed(() => {
    return viewTextList.value.reduce((acc, item) => {
      return acc + item.workTime()
    }, 0)
  })

  watch(days, () => {
    days.value.forEach((item, index) => {
      textList[index] = item
    })
  })

  return {
    area,
    datePick,
    sltWorkRate,
    workRateNameList,
    dateRanges,
    datePickFormat,
    createDayjs,
    days,
    textList,
    viewTextList,
    totalWorkTime
  }
}