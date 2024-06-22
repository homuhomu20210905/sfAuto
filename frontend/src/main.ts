import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as dayjs from 'dayjs'

// 最大値・最小値の計算するための拡張プラグイン
//import * as minMax from 'dayjs/esm/plugin/minMax'

// 日本時間に変換する
import 'dayjs/locale/ja'

// プラグイン拡張
//dayjs.extend(minMax.default)
dayjs.locale('ja')

const vuetify = createVuetify({
    components,
    directives,
  })

const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
