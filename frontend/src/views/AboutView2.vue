<script setup lang="ts">
import Flex from '../components/Design/Flex.vue'

import { ref, computed, readonly, watch, reactive } from 'vue'
import dayjs from 'dayjs'
import { calc, computeds } from '../service/userAbout'
import axios from 'axios'

import TimeWorkList from '@/components/TimeWorkList.vue'
import CopyButtons from '../components/CopyButtons.vue'



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
  getHoliday,
  noteList, sltWorkRate, startTime, endTime, timeList } = computeds();


// originalDaysListが変更になった場合、updateDaysListを洗替を行う
watch(originalDaysList, () => {
  const list = [...updateDaysList];
  updateDaysList.length = 0
  const holiday = getHoliday();
  originalDaysList.value.forEach((item, index) => {
    const date = dayjs(item.date);
    const day = date.day()
    const description = holiday[date.format('YYYY-MM-DD')] || '';
    const isHoliday = day === 0 || day === 6 || description;
    updateDaysList.push({
      date: item.date,
      start: item.start,
      end: item.end,
      sleep: list[index]?.sleep || item.sleep,
      // start: item.start,
      // end: item.end,
      // sleep: item.sleep,
      description: item.description + description,
      size: item.size,
      inputFlg: item.inputFlg,
      visible: !isHoliday
    });
  })
})




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
        <v-dialog max-width="500">
          <template v-slot:activator="{ props: activatorProps }">
            <v-row>
              <v-col>
                <v-select label="時間割合" v-model="sltWorkRate" :items="workRateNameList" variant="outlined"
                  width="15vw"></v-select>
              </v-col>
              <v-col>
                <v-btn v-bind="activatorProps" color="surface-variant" text="一括反映" variant="flat"></v-btn>
              </v-col>
            </v-row>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Dialog">
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <Flex>
                      <v-text-field hint="変更すると一括で明細側の備考に反映されます。" label="備考(一括入力用)" variant="outlined"
                        v-model="descriptionText"></v-text-field>
                    </Flex>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    始業時間：<input type="time" v-model="startTime" />
                  </v-col>
                  <v-col>
                    終了時間：<input type="time" v-model="endTime" />
                  </v-col>

                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text="Close Dialog" @click="isActive.value = false"></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>

    <CopyButtons :workInputList="workInputList" :workList="workList" :allList="allList" :noteList="noteList"
      :sltWorkRate="sltWorkRate" :timeList="timeList" />
    <v-row>
      <v-col cols="12">
        <timeWorkList :updateDaysList="updateDaysList" :viewDaysList="viewDaysList" />
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
