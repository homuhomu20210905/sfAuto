<template>
  <div class="flex">
    <slot></slot>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  gap: 1rem;
  align-items: baseline;
}

.--start {
  align-items: flex-start;
}

.--center {
  align-items: center;
}

.checkbox-input {
  flex-direction: row-reverse;
}
</style>
