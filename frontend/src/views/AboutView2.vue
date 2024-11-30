<script setup lang="ts">
import Flex from '../components/Design/Flex.vue'

import { ref, computed, readonly, watch, reactive } from 'vue'
import CopyToolTipButton from '../components/CopyToolTipButton.vue'
import dayjs from 'dayjs'
import { calc, computeds } from '../service/userAbout'


const { workRateNameList } = calc()
const { datePick,
  descriptionText,
  datePickFormat,
  originalDaysList,
  updateDaysList,
  viewDaysList,
  outputDaysList,
  totalWorkTime,
  workInputList,
  workList,
  allList,
  noteList, sltWorkRate } = computeds();




// originalDaysListが変更になった場合、updateDaysListを洗替を行う
watch(originalDaysList, () => {
  const list = [...updateDaysList];
  updateDaysList.length = 0
  originalDaysList.value.forEach((item, index) => {
    updateDaysList[index] = {
      date: item.date,
      start: list[index]?.start || item.start,
      end: list[index]?.end || item.end,
      sleep: list[index]?.sleep || item.sleep,
      // start: item.start,
      // end: item.end,
      // sleep: item.sleep,
      description: item.description,
      size: item.size,
      inputFlg: item.inputFlg,
      visible: list[index]?.visible ?? item.visible
    }
  })
})

/**
 * 日付の背景色を取得する
 * @param date 日付
 */
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
  <div>
    <v-row>
      <v-col cols="6">
        <Flex class="ma-10 text-h5">
          期間１：<input type="date" v-model="datePick[0]" />
        </Flex>
      </v-col>
      <v-col cols="6">
        <Flex class="ma-10 text-h5">
          期間２：<input type="date" v-model="datePick[1]" />
        </Flex>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Flex>
          <v-text-field hint="変更すると一括で明細側の備考に反映されます。" label="備考(一括入力用)" variant="outlined"
            v-model="descriptionText"></v-text-field>
        </Flex>
      </v-col>
      <v-col>
        <v-select label="時間割合" v-model="sltWorkRate" :items="workRateNameList" variant="outlined"
          width="15vw"></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <template v-if="workInputList?.length">
          <CopyToolTipButton buttonName="１．時間入力をコピーする" :list="workInputList" prepend-icon="mdi-clock-time-nine-outline"
            color="lime-lighten-4" />
        </template>
      </v-col>
      <v-col cols="3">
        <template v-if="workList?.length">
          <template v-if="sltWorkRate">
            <CopyToolTipButton :buttonName="'２．' + sltWorkRate + 'でコピーする'" :list="workList" color="light-blue-lighten-4"
              prepend-icon="mdi-chart-pie" />
          </template>
        </template>
      </v-col>
      <v-col cols="3">
        <template v-if="noteList?.length">
          <CopyToolTipButton buttonName="３．備考情報をコピーする" :list="noteList" color="cyan-lighten-4"
            prepend-icon="mdi-note-text-outline" />
        </template>
      </v-col>
      <v-col cols="3">
        <template v-if="allList?.length && sltWorkRate">
          <CopyToolTipButton color="red-lighten-4" prepend-icon="mdi-select-all" buttonName="４．１ + ２ + ３をまとめた処理をコピー"
            :list="allList" />
        </template>
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
                  <v-divider></v-divider>
                </v-card>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>

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
