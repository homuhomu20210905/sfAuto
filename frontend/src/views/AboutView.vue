<script setup lang="ts">
import Flex from '../components/Design/Flex.vue'
import SessionKey from '../assets/Constants'
import { ref, computed, readonly } from 'vue'
import dayjs from 'dayjs'
const area = ref('')
const showCopied = ref(false)
const showWorkCopied = ref(false)
const showWorkInputCopied = ref(false)
//時間割合のリスト
const sltWorkRate = ref('')
const workRateNameList = readonly([
  '現場対応／リモート	',
  '現場対応／出社',
  '【承認済】ICT対応／出社',
  'リモート'
])

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
  const code = `$("#ttvTimeSt${yyyymmdd}").click();$("#startTime").value = ${startTime};$("#endTime").value = ${endTime};$("#dlgInpTimeOk").click();await Sleep();`
  return code
}

// ノート用
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
  return convertTemplate(codeList)
})

// 時間割合用
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
  return convertTemplate(codeList)
})

//時間入力
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
  return convertTemplate(codeList)
})

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time)) //timeはミリ秒

async function clipboardCopy(value: string) {
  if (value) {
    try {
      navigator.clipboard.writeText(value)
      showCopied.value = true
    } catch (e) {
      console.log(e)
    } finally {
      await sleep(500)
      showCopied.value = false
    }
  }
}

async function clipboardWorkCopy(value: string) {
  if (value) {
    try {
      navigator.clipboard.writeText(value)
      showWorkCopied.value = true
    } catch (e) {
      console.log(e)
    } finally {
      await sleep(500)
      showWorkCopied.value = false
    }
  }
}

async function clipboardWorkInputCopy(value: string) {
  if (value) {
    try {
      navigator.clipboard.writeText(value)
      showWorkInputCopied.value = true
    } catch (e) {
      console.log(e)
    } finally {
      await sleep(500)
      showWorkInputCopied.value = false
    }
  }
}
</script>
<template>
  <Flex style="justify-content: space-around">
    <v-textarea v-model="area"></v-textarea>
    <!-- <pre>{{ area }}</pre> -->
  </Flex>
  <Flex> </Flex>
  <Flex>
    <v-contener>
      <v-row>
        <v-col cols="12">
          <template v-if="noteList?.length">
            <v-tooltip v-model="showCopied" location="top" :open-on-hover="false">
              <template #activator="{ props, isActive }"
                ><v-btn @click="clipboardCopy(noteList)" v-bind="props">備考情報をコピーする</v-btn>
              </template>
              <span>コピーしました</span>
            </v-tooltip>
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <Flex>
            <v-select
              label="Select"
              v-model="sltWorkRate"
              :items="workRateNameList"
              variant="outlined"
              style="width: auto; min-width: 200px"
            ></v-select>
            <template v-if="workList?.length">
              <template v-if="sltWorkRate">
                <v-tooltip v-model="showWorkCopied" location="top" :open-on-hover="false">
                  <template #activator="{ props, isActive }"
                    ><v-btn @click="clipboardWorkCopy(workList)" v-bind="props"
                      >{{ sltWorkRate }}でコピーする</v-btn
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
        <v-col>
          <template v-if="workInputList?.length">
            <v-tooltip v-model="showWorkInputCopied" location="top" :open-on-hover="false">
              <template #activator="{ props, isActive }"
                ><v-btn @click="clipboardWorkInputCopy(workInputList)" v-bind="props"
                  >時間入力をコピーする</v-btn
                >
              </template>
              <span>コピーしました</span>
            </v-tooltip>
          </template>
        </v-col>
      </v-row>
    </v-contener>
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
