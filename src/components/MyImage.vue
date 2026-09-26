<script setup lang="ts">
const props = defineProps<{
  blob: Blob;
}>();

const url = ref("");

onMounted(() => {
  url.value = URL.createObjectURL(props.blob);
});

onUnmounted(() => {
  if (url.value) {
    URL.revokeObjectURL(url.value);
    url.value = "";
  }
});
</script>

<template>
  <img lazy :src="url" />
</template>
