<template>
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
        <CopyToolTipButton color="red-lighten-4" prepend-icon="mdi-select-all" buttonName="４．全部(1+2+3)まとめた処理をコピー"
          :list="allList" />
      </template>
    </v-col>
    <v-col cols="3">
      <template v-if="timeList?.length && sltWorkRate">
        <CopyToolTipButton color="purple-lighten-4" prepend-icon="mdi-select-all" buttonName="５．備考以外(1+2)まとめた処理をコピー"
          :list="timeList" />
      </template>

    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import CopyToolTipButton from '../components/CopyToolTipButton.vue'

const { workInputList, workList, allList, noteList, sltWorkRate, timeList } = defineProps(['workInputList', 'workList', 'allList', 'noteList', 'sltWorkRate', 'timeList'])
</script>