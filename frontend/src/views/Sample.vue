<script setup>
import { ref, computed } from 'vue'
import SessionKey from '../assets/Constants'

const days = ref([])

const value = sessionStorage.getItem(SessionKey.DAYS)
if (value) {
  const list = JSON.parse(value)
  if (list.length > 0) {
    days.value = list
  }
}
</script>

<template>
  {{ days }}
</template>
