<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import axios from 'axios';

(() => {
  const holiday_session_storage = 'holiday'
  axios.get('https://holidays-jp.github.io/api/v1/date.json')
    .then(response => {
      console.log(response.data);
      sessionStorage.setItem(holiday_session_storage, JSON.stringify(response.data));
    })
})();
onMounted(() => {
  console.log('mounted')

  useRouter().push({ name: 'home' })
})

const drawer = ref<boolean>(true)
</script>

<template>
  <v-app>
    <v-app-bar app fixed elevate-on-scroll>
      <v-btn class="" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list nav dense>
        <v-list-item-group active-class="deep-purple--text text--accent-4">
          <v-list-item to="/">
            <v-list-item-title>Home(説明)</v-list-item-title>
          </v-list-item>
          <v-list-item to="/about">
            <v-list-item-title>TSV一括入力</v-list-item-title>
          </v-list-item>
          <v-list-item to="/about2">
            <v-list-item-title>時間入力</v-list-item-title>
          </v-list-item>
          <v-list-item to="/vuetify">
            <v-list-item-title>仮</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>
#app {
  width: 100%;
}
</style>
