<script setup lang="ts">
import Flex from '../components/Design/Flex.vue'
import SessionKey from '../assets/Constants'
import { ref, computed, readonly } from 'vue'
import dayjs from 'dayjs'
const area = ref('')
// トーストを表示するためのフラグ
const showNoteCopied = ref(false)
const showWorkCopied = ref(false)
const showWorkInputCopied = ref(false)
const showAllCopied = ref(false)

//時間割合のリスト
const sltWorkRate = ref('')
const workRateNameList = readonly([
  '現場対応／リモート	',
  '現場対応／出社',
  '【承認済】ICT対応／出社',
  'リモート'
])

//コピー状態のenum
enum CopyStatus {
  ShowNoteCopied = 'showCopied',
  ShowWorkCopied = 'showWorkCopied',
  ShowWorkInputCopied = 'showWorkInputCopied',
  ShowAllCopied = 'showAllCopied'
}

//日付情報の型
type DayInfo = {
  date: string
  start: string
  end: string
  sleep: string
  description: string
  size: number
}

// 算出プロパティの参照

const days = computed(() => {
  const list = area.value.split('\n')
  if (list.length === 1) return []
  const calcList = list
    .map((item) => {
      const tabs = item.split('\t')
      const obj = {
        date: tabs[0],
        start: tabs[1],
        end: tabs[2],
        sleep: tabs[3],
        description: tabs[4],
        size: tabs.length
      }
      return obj
    })
    .filter((item) => {
      return item.size === 5 && item.description
    })

  //キー情報の保存
  if (calcList.length !== 0) {
    sessionStorage.setItem(SessionKey.DAYS, JSON.stringify(calcList))
  } else {
    sessionStorage.removeItem(SessionKey.DAYS)
  }

  return calcList
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
  const code = `$("#dailyNoteIcon${yyyymmdd}").click();$("#dialogNoteText2").value="${description}";$("#dialogNoteOk").click();await Sleep();`
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
  const list = days.value
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
  const list = days.value
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
  const list = days.value
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

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time)) //timeはミリ秒

const switchCopyStatus = (ref: CopyStatus, flag: boolean): void => {
  switch (ref) {
    case CopyStatus.ShowNoteCopied:
      showNoteCopied.value = flag
      break
    case CopyStatus.ShowWorkCopied:
      showWorkCopied.value = flag
      break
    case CopyStatus.ShowWorkInputCopied:
      showWorkInputCopied.value = flag
      break
    case CopyStatus.ShowAllCopied:
      showAllCopied.value = flag
      break
  }
}

/**
 * クリップボードにコピーする
 * @param list
 * @param ref
 */
async function clipboardRefCopy(list: string[], ref: CopyStatus) {
  if (list) {
    try {
      navigator.clipboard.writeText(convertTemplate(list))
      switchCopyStatus(ref, true)
    } catch (e) {
      console.log(e)
    } finally {
      await sleep(500)
      switchCopyStatus(ref, false)
    }
  }
}
</script>
<template>
  <v-row>
    <v-col cols="12">
      <p>１．タブ区切りのテキストエリアに貼り付ける。</p>
      <p>　日付 開始時間 終了時間 休憩時間 備考</p>
      <p>　例）`2024/06/17 9:45 19:45 1:00 製造、打ち合わせ`</p>
      <p>２．各種クリップボードボタンを押下すると関数がコピーされる。</p>
      <p>３．topを「vfFrameId～(AtkWorkTimeView)」変える。</p>
      <p>４．関数をSalesForceの管理コンソールに貼り付けると自動入力が開始。</p>
    </v-col>
  </v-row>
  <hr />
  <Flex style="justify-content: space-around">
    <v-textarea label="勤怠情報をタブ区切りで入力してください。" v-model="area"></v-textarea>
    <!-- <pre>{{ area }}</pre> -->
  </Flex>
  <Flex> </Flex>
  <Flex>
    <v-container>
      <v-row>
        <v-col>
          <template v-if="workInputList?.length">
            <v-tooltip v-model="showWorkInputCopied" location="top" :open-on-hover="false">
              <template #activator="{ props, isActive }"
                ><v-btn
                  @click="clipboardRefCopy(workInputList, CopyStatus.ShowWorkInputCopied)"
                  v-bind="props"
                  color="lime-lighten-4"
                  prepend-icon="mdi-clock-time-nine-outline"
                  >１．時間入力をコピーする</v-btn
                >
              </template>
              <span>コピーしました</span>
            </v-tooltip>
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <Flex>
            <template v-if="workList?.length">
              <Flex>
                <v-select
                  label="時間割合"
                  v-model="sltWorkRate"
                  :items="workRateNameList"
                  variant="outlined"
                ></v-select>
              </Flex>
              <template v-if="sltWorkRate">
                <v-tooltip v-model="showWorkCopied" location="top" :open-on-hover="false">
                  <template #activator="{ props, isActive }"
                    ><v-btn
                      @click="clipboardRefCopy(workList, CopyStatus.ShowWorkCopied)"
                      v-bind="props"
                      color="light-blue-lighten-4"
                      prepend-icon="mdi-chart-pie"
                      >２．{{ sltWorkRate }}でコピーする</v-btn
                    >
                  </template>
                  <span>コピーしました</span>
                </v-tooltip>
              </template>
            </template>
          </Flex>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <template v-if="noteList?.length">
            <v-tooltip v-model="showNoteCopied" location="top" :open-on-hover="false">
              <template #activator="{ props, isActive }"
                ><v-btn
                  @click="clipboardRefCopy(noteList, CopyStatus.ShowNoteCopied)"
                  v-bind="props"
                  color="cyan-lighten-4"
                  prepend-icon="mdi-note-text-outline"
                  >３．備考情報をコピーする</v-btn
                >
              </template>
              <span>コピーしました</span>
            </v-tooltip>
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <template v-if="allList?.length">
            <v-tooltip v-model="showAllCopied" location="top" :open-on-hover="false">
              <template #activator="{ props, isActive }"
                ><v-btn
                  @click="clipboardRefCopy(allList, CopyStatus.ShowAllCopied)"
                  v-bind="props"
                  color="red-lighten-4"
                  prepend-icon="mdi-note-text-outline"
                  >４．１ + ２ + ３をまとめた処理をコピー</v-btn
                >
              </template>
              <span>コピーしました</span>
            </v-tooltip>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </Flex>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
