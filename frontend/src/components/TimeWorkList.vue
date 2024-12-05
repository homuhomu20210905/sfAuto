<template>
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
                    <input type="time" style="width: min-content" class="p-0 m-0" v-model="updateDaysList[index].end" />

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
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { calc, computeds } from '../service/userAbout'

const props = defineProps(['updateDaysList', 'viewDaysList'])
const { updateDaysList } = props;
const { getHoliday } = computeds();

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
  const holiday = getHoliday();
  if (holiday[date.format('YYYY-MM-DD')]) {
    return 'green-lighten-4'
  }
  return ''
}


</script>