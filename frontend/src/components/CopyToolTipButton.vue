<script setup lang="ts">
import { ref, computed, readonly } from 'vue'
import { CopyStatus } from '../assets/CopyStatus'
const showCopied = ref(false)

const props = defineProps({
  buttonName: String,
  list: { type: Array<String>, required: true },
  color: { type: String, default: 'red-lighten-4' },
  prependIcon: { type: String, default: 'mdi-note-text-outline' }
})

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time)) //timeはミリ秒

/**
 * 大枠のasync関数を作成
 * @param codeList
 */
function convertTemplate() {
  const sleep =
    `const Sleep=async()=>("none"!=$("#BusyWait").style.display&&(await new Promise(a=>setTimeout(a,10)),await Sleep()),!0);`

  const code = `(async ($) => {${sleep} ${props.list.join('\r\n')}})($);`
  return code
}

/**
 * クリップボードにコピーする
 * @param list
 * @param ref
 */
async function clipboardRefCopy(list: String[]) {
  console.log('list:', list)
  if (list) {
    try {
      navigator.clipboard.writeText(convertTemplate())
      showCopied.value = true
    } catch (e) {
      console.log(e)
    } finally {
      await sleep(500)
      showCopied.value = false
    }
  }
}
</script>

<template>
  <v-tooltip v-model="showCopied" location="top" :open-on-hover="false">
    <template #activator="{ props, isActive }">
      <v-btn @click="clipboardRefCopy(list)" v-bind="props" :color="color" :prepend-icon="prependIcon">
        {{ buttonName }}
      </v-btn>
    </template>
    <span>コピーしました</span>
  </v-tooltip>
</template>
