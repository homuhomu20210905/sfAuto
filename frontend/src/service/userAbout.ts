import dayjs from 'dayjs'
import { computed, reactive, ref } from 'vue'
import type { OutputData, ViewData } from '../types/userAboutType'
import SessionKey from '../assets/Constants'
const workRateNameList = [
  '現場対応／リモート	',
  '現場対応／出社',
  '【承認済】ICT対応／出社',
  'リモート'
]
// 算出プロパティの参照
const createDayjs = (day: string, time: string) => {
  return dayjs(day + ' ' + time)
}

/**
 * chromeのデベロッパーツールに出力するフォーマットを用意する
 */
export function calc() {
  /**
   * 備考情報を入力するコマンドを作成
   * @param yyyymmdd
   * @param description
   */
  function createDescCommand(yyyymmdd: string, description: string) {
    const code = `$("#dailyNoteIcon${yyyymmdd}").click();$("#dialogNoteText2").value=$("#dialogNoteText2").value + "　${description}";$("#dialogNoteOk").click();await Sleep();`
    return code
  }

  /**
   * 時間割合を入力するコマンドを作成
   * @param yyyymmdd
   */
  function createTimeRateCommand(yyyymmdd: string, sltWorkRate: string) {
    const index = workRateNameList.findIndex((item) => item === sltWorkRate) || 0
    const code = `$("#dailyWorkCell${yyyymmdd}").click();$("#empInputTime${index}").value = $("#empWorkRealTime").innerHTML.replace("実労働時間：","");$("#empWorkOk").click();await Sleep();`
    return code
  }

  /**
   * 時間割合を入力するコマンドを作成
   * @param yyyymmdd
   * @param startTime
   * @param endTime
   */
  function createTimeInputCommand(yyyymmdd: string, startTime: string, endTime: string) {
    const code = `$("#ttvTimeSt${yyyymmdd}").click();$("#startTime").value = "${startTime}";$("#endTime").value = "${endTime}";$("#dlgInpTimeOk").click();await Sleep();`
    return code
  }

  return {
    createDescCommand,
    createTimeInputCommand,
    createTimeRateCommand,
    workRateNameList,
    createDayjs
  }
}

export const computeds = () => {
  const { createDescCommand, createTimeInputCommand, createTimeRateCommand, createDayjs } = calc()
  const yyyymmdd = dayjs(new Date()).format('YYYY-MM-DD')
  const datePick = ref([yyyymmdd, yyyymmdd])
  const descriptionText = ref('')
  const startTime = ref('09:30')
  const endTime = ref('18:30')
  //時間割合のリスト
  const sltWorkRate = ref('')

  /**
   * 数値の配列を受け取り、全ての要素の合計を返す関数です。
   *
   * @param {number[]} numbers - 合計する数値の配列。
   * @returns {number} 配列内の全ての数値の合計。
   */
  const dateRanges = computed(() => {
    const date1 = datePick.value[0]
    const date2 = datePick.value[datePick.value.length - 1]
    if (dayjs(date1).isAfter(dayjs(date2))) {
      return {
        startDate: date2,
        endDate: date1
      }
    }
    return {
      startDate: date1,
      endDate: date2
    }
  })
  /**
   * 日付を特定の形式で表示する
   * @returns {string} フォーマットされた日付文字列
   */
  const datePickFormat = computed(() => {
    const date1 = dateRanges.value.startDate
    const date2 = dateRanges.value.endDate
    return dayjs(date1).format('YYYY/MM/DD') + ' - ' + dayjs(date2).format('YYYY/MM/DD')
  })

  /**
   * 選択された日付範囲内の日々の情報を計算し、
   * リストとして返すための算出プロパティ
   */
  const originalDaysList = computed(() => {
    const { startDate, endDate } = dateRanges.value
    const length = dayjs(endDate).diff(dayjs(startDate), 'day')
    const calcList = []
    const sTime = createDayjs(startDate, startTime.value).format('HH:mm')
    const eTime = createDayjs(startDate, endTime.value).format('HH:mm')
    console.log(sTime)
    for (let i = 0; i < length; i++) {
      const date = dayjs(startDate).add(i, 'day').format('YYYY/MM/DD')
      const start = createDayjs(date, sTime).format('HH:mm')
      const end = createDayjs(date, eTime).format('HH:mm')
      const sleep = createDayjs(date, '01:00').format('HH:mm')
      const day = dayjs(date).day()
      const isHoliday = day === 0 || day === 6
      const obj: OutputData = {
        date,
        start,
        end,
        sleep,
        description: descriptionText.value,
        size: 5,
        inputFlg: false,
        visible: !isHoliday
      }
      calcList.push(obj)
    }

    //キー情報の保存
    if (calcList.length !== 0) {
      sessionStorage.setItem(SessionKey.DAYS, JSON.stringify(calcList))
    } else {
      sessionStorage.removeItem(SessionKey.DAYS)
    }

    return calcList
  })

  // 元情報から値を変更するためのリアクティブオブジェクト
  const updateDaysList = reactive(originalDaysList.value)

  // 画面表示用のリスト
  const viewDaysList = computed(() => {
    return updateDaysList.map((item) => {
      const obj: ViewData = {
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

  /**
   * 勤務情報を出力する際の共通処理
   * @param callBack : 出力する情報を整形する関数
   */
  const convertOutputList = (callBack: (item: OutputData) => string) => {
    const list = outputDaysList.value
    if (list.length == 0) {
      return null
    }
    const codeList = list.map(callBack)
    return codeList
  }

  // 3.ノート用
  const noteList = computed(() => {
    return convertOutputList((item) => {
      const yyyymmdd = dayjs(item.date).format('YYYY-MM-DD')
      const code = createDescCommand(yyyymmdd, item.description)
      return code
    })
  })

  // 2.時間割合用
  const workList = computed(() => {
    return convertOutputList((item) => {
      const yyyymmdd = dayjs(item.date).format('YYYY-MM-DD')
      const code = createTimeRateCommand(yyyymmdd, sltWorkRate.value)
      return code
    })
  })

  //1.時間入力
  const workInputList = computed(() => {
    return convertOutputList((item) => {
      const yyyymmdd = dayjs(item.date).format('YYYY-MM-DD')
      const code = createTimeInputCommand(yyyymmdd, item.start, item.end)
      return code
    })
  })

  const allList = computed(() => {
    const list: string[] = []
    if (workInputList.value) {
      list.push(...workInputList.value)
    }
    if (workList.value) {
      list.push(...workList.value)
    }
    if (noteList.value) {
      list.push(...noteList.value)
    }
    return list
  })
  const outputDaysList = computed(() => {
    return updateDaysList.filter((item) => item.visible)
  })
  // 勤務時間を算出する
  const totalWorkTime = computed(() => {
    return viewDaysList.value
      .filter((item) => item.visible)
      .reduce((acc, item) => {
        return acc + item.workTime()
      }, 0)
  })

  return {
    datePick,
    descriptionText,
    datePickFormat,
    originalDaysList,
    updateDaysList,
    viewDaysList,
    outputDaysList,
    totalWorkTime,
    workInputList,
    workList,
    noteList,
    allList,
    sltWorkRate,
    startTime,
    endTime
  }
}
