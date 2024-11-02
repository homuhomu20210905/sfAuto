<script setup lang="ts">
import Flex from '../components/Design/Flex.vue'
import SessionKey from '../assets/Constants'
import { ref, computed, readonly, watch, reactive } from 'vue'
import CopyToolTipButton from '../components/CopyToolTipButton.vue'
import dayjs from 'dayjs'
// const area = ref('')
const area = { value: '' }
const datePick = ref([new Date(), new Date()])

//時間割合のリスト
const sltWorkRate = ref('')
const workRateNameList = readonly([
  '現場対応／リモート	',
  '現場対応／出社',
  '【承認済】ICT対応／出社',
  'リモート'
])

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

// 算出プロパティの参照
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

  //キー情報の保存
  if (calcList.length !== 0) {
    sessionStorage.setItem(SessionKey.DAYS, JSON.stringify(calcList))
  } else {
    sessionStorage.removeItem(SessionKey.DAYS)
  }

  return calcList
})

const textList = reactive(days.value)

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
      inputFlg: item.inputFlg
    }
    return obj
  })
})

const totalWorkTime = computed(() => {
  return viewTextList.value.reduce((acc, item) => {
    return acc + item.workTime()
  }, 0)
})

// 監視対象は days であり count は監視対象外
watch(days, () => {
  days.value.forEach((item, index) => {
    textList[index] = item
  })
})

/**
 * 大枠のasync関数を作成
 * @param codeList
 */
function convertTemplate(codeList: string[]) {
  const sleep =
    'const Sleep=async()=>("none"!=$("#BusyWait").style.display&&(await new Promise(a=>setTimeout(a,10)),await Sleep()),!0);'

  const code = `(async ($) => {${sleep} ${codeList.join('\r\n')}})($);`
  return code
}
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
function createTimeRateCommand(yyyymmdd: string) {
  const index = workRateNameList.findIndex((item) => item === sltWorkRate.value) || 0
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

// 3.ノート用
const noteList = computed(() => {
  const list = textList
  if (list.length == 0) {
    return null
  }
  const codeList = list.map((item) => {
    const yyyymmdd = dayjs(item.date).format('YYYY-MM-DD')
    const code = createDescCommand(yyyymmdd, item.description)
    return code
  })
  return codeList
})

// 2.時間割合用
const workList = computed(() => {
  const list = textList
  if (list.length == 0) {
    return null
  }
  const codeList = list.map((item) => {
    const yyyymmdd = dayjs(item.date).format('YYYY-MM-DD')
    const code = createTimeRateCommand(yyyymmdd)
    return code
  })
  return codeList
})

//1.時間入力
const workInputList = computed(() => {
  const list = textList
  if (list.length == 0) {
    return null
  }
  const codeList = list.map((item) => {
    const yyyymmdd = dayjs(item.date).format('YYYY-MM-DD')
    const code = createTimeInputCommand(yyyymmdd, item.start, item.end)
    return code
  })
  return codeList
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
      <p>１．タブ区切りのテキストエリアに貼り付ける。</p>
      <p>　日付 開始時間 終了時間 休憩時間 備考</p>
      <pre>　例）`2024/06/17	9:45	19:45	1:00	製造、打ち合わせ`</pre>
      <p>２．各種クリップボードボタンを押下すると関数がコピーされる。</p>
      <p>３．topを「vfFrameId～(AtkWorkTimeView)」変える。</p>
      <p>４．関数をSalesForceの管理コンソールに貼り付けると自動入力が開始。</p>
    </v-col>
  </v-row>
  <hr />
  {{ datePickFormat }}
  <Flex style="justify-content: space-around">
    <v-date-picker multiple="range" v-model="datePick"></v-date-picker>
    <!-- <pre>{{ area }}</pre> -->
  </Flex>
  <Flex>
    <v-container>
      <v-row>
        <v-col>
          {{ totalWorkTime }}
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <template v-if="workInputList?.length">
            <CopyToolTipButton
              buttonName="１．時間入力をコピーする"
              :list="workInputList"
              prepend-icon="mdi-clock-time-nine-outline"
              color="lime-lighten-4"
            />
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <Flex>
            <template v-if="workList?.length">
              <template v-if="sltWorkRate">
                <CopyToolTipButton
                  :buttonName="'２．' + sltWorkRate + 'でコピーする'"
                  :list="workList"
                  color="light-blue-lighten-4"
                  prepend-icon="mdi-chart-pie"
                />
              </template>
              <Flex>
                <v-select
                  label="時間割合"
                  v-model="sltWorkRate"
                  :items="workRateNameList"
                  variant="outlined"
                ></v-select>
              </Flex>
            </template>
          </Flex>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <template v-if="noteList?.length">
            <CopyToolTipButton
              buttonName="３．備考情報をコピーする"
              :list="noteList"
              color="cyan-lighten-4"
              prepend-icon="mdi-note-text-outline"
            />
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <template v-if="allList?.length && sltWorkRate">
            <CopyToolTipButton
              color="red-lighten-4"
              prepend-icon="mdi-select-all"
              buttonName="４．１ + ２ + ３をまとめた処理をコピー"
              :list="allList"
            />
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card class="mx-auto" tile>
            <v-list dense subheader three-line class="overflow-y-auto" style="max-height: 800px">
              <v-subheader>テキストエリアから取得した勤務情報</v-subheader>
              <v-list-item
                v-for="(item, index) in viewTextList"
                :key="item.date.format('YYYY-MM-DD') + index"
              >
                <v-list-item-content>
                  <v-card :color="getColor(item.date)">
                    <v-list-item-title>
                      <Flex> </Flex>
                      <Flex>
                        <Flex>
                          <v-btn
                            @click="textList[index].inputFlg = !textList[index].inputFlg"
                            :color="textList[index].inputFlg ? 'success' : 'primary'"
                          >
                            {{ textList[index].inputFlg ? '編集解除' : '編集' }}
                          </v-btn>

                          <v-checkbox
                            v-model="textList[index].visible"
                            class="m-0 p-0"
                          ></v-checkbox>
                          {{ item.date.format('MM/DD(ddd)') }}
                        </Flex>
                        <Flex>
                          <template v-if="item.inputFlg">
                            <input
                              type="time"
                              style="width: min-content"
                              class="p-0 m-0"
                              v-model="textList[index].start"
                            />
                            -
                            <input
                              type="time"
                              style="width: min-content"
                              class="p-0 m-0"
                              v-model="textList[index].end"
                            />

                            <input
                              v-model="textList[index].description"
                              type="text"
                              style="width: auto; border: solid 1px"
                            />
                          </template>
                          <template v-else>
                            {{ item.start.format('HH:mm') }}
                            -
                            {{ item.end.format('HH:mm') }}
                            {{ item.description }}
                          </template>
                        </Flex>
                      </Flex>
                    </v-list-item-title>
                    <v-list-item-subtitle>勤務:{{ item.workTime() }}時間</v-list-item-subtitle>
                    <v-list-item-subtitle
                      >休憩:{{ item.sleepMinute() / 60 }}時間
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
</style>
