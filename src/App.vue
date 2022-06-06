<script setup lang="ts">
import { darkTheme } from 'naive-ui'
const theme = computed(() => {
  return isDark.value ? darkTheme : null
})
</script>

<template>
  <n-config-provider :theme="theme">
    <n-scrollbar style="max-height: 100vh">
      <main
        font-sans p="x-4 y-10" text="center gray-700 dark:gray-200"
      >
        <router-view />
        <Footer />
      </main>
    </n-scrollbar>
  </n-config-provider>
</template>
