<script setup lang="ts">
import { ref, computed } from 'vue'
import ImgConstant from '../assets/ImgConstant'
import TheWelcome from '../components/TheWelcome.vue'
const gifBase64 = ref(ImgConstant.GIF_BASE64)
//const gifUseBase64 = ref(ImgConstant.GIF_USE_CASE_BASE64)
</script>

<template>
  <h1>使う前の準備</h1>
  <h3>勤務表を開いて、F12を押下するとDeveloperToolが表示されます。</h3>
  <img :src="'data:image/gif;base64,' + gifBase64" />
  <h3>
    当該サイトはiframeとShadowDOMを用いているのでコンソールタブ上部のTOPのframeを切り替える必要がある
  </h3>
  <h3>プルダウンからvfFrameId～(AtkWorkTimeView)と書いてあるものを選んでください。</h3>

  <h2>使い方</h2>
  <p>以下参照。(約2MBあるのでアップロードできなかったのでリンクのみ)</p>
  <v-btn
    href="https://drive.google.com/file/d/12KTx8swUyoIjeABso0HaHhy_JhguJpVP/view?usp=sharing"
    variant="plain"
    color="blue"
    target="_blank"
    >使い方はこちら</v-btn
  >
</template>
