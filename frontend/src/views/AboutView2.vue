<script setup lang="ts">
import Flex from '../components/Design/Flex.vue'
import SessionKey from '../assets/Constants'
import { ref, computed, readonly, watch, reactive } from 'vue'
import CopyToolTipButton from '../components/CopyToolTipButton.vue'
import dayjs from 'dayjs'
import { calc } from '../service/userAbout'
const datePick = ref([new Date(), new Date()])
const descriptionText = ref('')

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
  inputFlg: boolean,
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

const { createDescCommand, createTimeInputCommand, createTimeRateCommand } = calc()

//時間割合のリスト
const sltWorkRate = ref('')
const workRateNameList = readonly([
  '現場対応／リモート	',
  '現場対応／出社',
  '【承認済】ICT対応／出社',
  'リモート'
])
/**
 * 数値の配列を受け取り、全ての要素の合計を返す関数です。
 *
 * @param {number[]} numbers - 合計する数値の配列。
 * @returns {number} 配列内の全ての数値の合計。
 */
const dateRanges = computed(() => {
  const startDate = datePick.value[0]
  const endDate = datePick.value[datePick.value.length - 1]
  return {
    startDate,
    endDate
  }
})
/**
 * 日付を特定の形式で表示する
 * @returns {string} フォーマットされた日付文字列
 */
const datePickFormat = computed(() => {
  const date1 = datePick.value[0]
  const date2 = datePick.value[datePick.value.length - 1]
  return dayjs(date1).format('YYYY/MM/DD') + ' - ' + dayjs(date2).format('YYYY/MM/DD')
})

// 算出プロパティの参照
const createDayjs = (day: string, time: string) => {
  return dayjs(day + ' ' + time)
}
/**
 * 選択された日付範囲内の日々の情報を計算し、
 * リストとして返すための算出プロパティ
 */
const originalDaysList = computed(() => {
  const { startDate, endDate } = dateRanges.value
  const length = dayjs(endDate).diff(dayjs(startDate), 'day')
  const calcList = []
  for (let i = 0; i <= length; i++) {
    const date = dayjs(startDate).add(i, 'day').format('YYYY/MM/DD')
    const start = createDayjs(date, '09:30').format('HH:mm')
    const end = createDayjs(date, '18:30').format('HH:mm')
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

// originalDaysListが変更になった場合、updateDaysListを洗替を行う
watch(originalDaysList, () => {
  updateDaysList.length = 0
  originalDaysList.value.forEach((item, index) => {
    updateDaysList[index] = item
  })
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

const getColor = (date: dayjs.Dayjs) => {
  if (date.day() === 6) {
    return 'blue-lighten-4'
  }
  if (date.day() === 0) {
    return 'red-lighten-4'
  }
  return ''
}
</script>
<template>
  <v-row>
    <v-col cols="12">
      <p>１．日付で範囲選択する。</p>
      <p>２．明細が下部に表示されるので適時変更する</p>
      <p>３．各種クリップボードボタンを押下すると関数がコピーされる。</p>
      <p>４．topを「vfFrameId～(AtkWorkTimeView)」変える。</p>
      <p>５．関数をSalesForceの管理コンソールに貼り付けると自動入力が開始。</p>
    </v-col>
  </v-row>
  <hr />
  <Flex>
    <v-card title="選択範囲期間" :text="datePickFormat">
    </v-card>
    <v-card title="営業日" :text="outputDaysList.length + '日'">
    </v-card>
    <v-card title="勤務時間" :text="totalWorkTime + '時間'">
    </v-card>
  </Flex>
  <Flex>
    <v-container>
      <v-row>
        <v-col>
          <Flex>
            <v-text-field hint="変更すると一括で明細側の備考に反映されます。" label="備考(一括入力用)" variant="outlined"
              v-model="descriptionText"></v-text-field>
          </Flex>
          <Flex style="justify-content: space-around">
            <v-date-picker multiple="range" v-model="datePick"></v-date-picker>
          </Flex>
        </v-col>
        <v-col>
          <v-row>
            <v-col>
              <template v-if="workInputList?.length">
                <CopyToolTipButton buttonName="１．時間入力をコピーする" :list="workInputList"
                  prepend-icon="mdi-clock-time-nine-outline" color="lime-lighten-4" />
              </template>
            </v-col>
            <v-col>
              <Flex>
                <template v-if="workList?.length">
                  <template v-if="sltWorkRate">
                    <CopyToolTipButton :buttonName="'２．' + sltWorkRate + 'でコピーする'" :list="workList"
                      color="light-blue-lighten-4" prepend-icon="mdi-chart-pie" />
                  </template>
                  <v-select label="時間割合" v-model="sltWorkRate" :items="workRateNameList" variant="outlined"
                    width="15vw"></v-select>
                </template>
              </Flex>
            </v-col>
            <v-col cols="12">
              <template v-if="noteList?.length">
                <CopyToolTipButton buttonName="３．備考情報をコピーする" :list="noteList" color="cyan-lighten-4"
                  prepend-icon="mdi-note-text-outline" />
              </template>
            </v-col>
            <v-col cols="12">
              <template v-if="allList?.length && sltWorkRate">
                <CopyToolTipButton color="red-lighten-4" prepend-icon="mdi-select-all"
                  buttonName="４．１ + ２ + ３をまとめた処理をコピー" :list="allList" />
              </template>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card class="mx-auto" tile>
            <v-list dense subheader three-line class="overflow-y-auto" style="max-height: 800px">
              <v-subheader>日付の範囲から取得した勤務情報</v-subheader>
              <v-list-item v-for="(item, index) in viewDaysList" :key="item.date.format('YYYY-MM-DD') + index">
                <v-list-item-content>
                  <v-card :color="getColor(item.date)">
                    <v-list-item-title>
                      <Flex> </Flex>
                      <Flex>
                        <div class="flex-container">
                          <v-btn @click="
                            updateDaysList[index].inputFlg = !updateDaysList[index].inputFlg
                            " :color="updateDaysList[index].inputFlg ? 'success' : 'primary'">
                            {{ updateDaysList[index].inputFlg ? '編集解除' : '編集' }}
                          </v-btn>

                          <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                              <div v-bind="props">
                                <input type="checkbox" v-model="updateDaysList[index].visible" />
                              </div>
                            </template>
                            <span>出勤日の場合ONにする</span>
                          </v-tooltip>


                          {{ item.date.format('MM/DD(ddd)') }}
                          <template v-if="item.inputFlg">
                            <input type="time" style="width: min-content" class="p-0 m-0"
                              v-model="updateDaysList[index].start" />
                            -
                            <input type="time" style="width: min-content" class="p-0 m-0"
                              v-model="updateDaysList[index].end" />

                            <input v-model="updateDaysList[index].description" type="text"
                              style="width: auto; border: solid 1px" />
                          </template>
                          <template v-else>
                            {{ item.start.format('HH:mm') }}
                            -
                            {{ item.end.format('HH:mm') }}
                            {{ item.description }}
                          </template>
                        </div>
                      </Flex>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <div class="flex-container">
                        <span>
                          勤務:{{ item.workTime() }}時間
                        </span>
                        <template v-if="updateDaysList[index].inputFlg">
                          <span>休憩:<input type="time" v-model="updateDaysList[index].sleep" /></span>
                        </template>
                        <template v-else>
                          <span>休憩:{{ item.sleepMinute() / 60 }}時間</span>
                        </template>
                      </div>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                    </v-list-item-subtitle>
                    <v-divider></v-divider>
                  </v-card>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Flex>
</template>

<style>
/* @media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
} */

.flex-container {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  column-gap: 20px;
}
</style>
