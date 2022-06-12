<script setup lang="ts">
import { verifyPermission } from '~/utils'
import { isDark } from '~/composables/dark'

const root = ref(null)

const list = ref<string[]>([])
const isDragging = ref(false)

async function processDrop(items: DataTransferItemList) {
  let handle
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind === 'file') {
      handle = await (items[i] as any).getAsFileSystemHandle()
      break
    }
  }
  if (handle) {
    if (handle?.kind === 'file') {
    // run file code
    }
    else if (handle?.kind === 'directory') {
      // run directory code
      // revoke blob url
      list.value.forEach((it) => {
        URL.revokeObjectURL(it)
      })
      list.value = []
      const perm = await verifyPermission(handle)
      if (perm) {
        const curList = list.value
        for await (const hnd of handle.values()) {
          // skip subdirectory
          if (hnd.kind !== 'file')
            continue

          const file: File = await hnd.getFile()
          if (file.type.includes('image')) {
            if (curList !== list.value)
              return
            const url = URL.createObjectURL(file)
            curList.push(url)
          }
        }
      }
    }
  }
}
onUnmounted(() => {
  // revoke blob url
  list.value.forEach((it) => {
    URL.revokeObjectURL(it)
  })
})

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  if (!event.dataTransfer)
    return
  event.preventDefault()
  const list = event.dataTransfer.items
  processDrop(list)
}
const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer?.types.includes('Files'))
    event.preventDefault()
}
const page = ref(0)
const pageSize = useStorage('pageSize', 100)
const pageCount = computed(() => {
  return Math.ceil(list.value.length / pageSize.value)
})
watch(pageSize, (newVal, oldVal) => {
  page.value = Math.floor(page.value * oldVal / newVal)
})

const filteredList = computed(() => {
  const start = page.value * pageSize.value
  return list.value.slice(start, start + pageSize.value)
})
const imagesRefs = ref<HTMLImageElement[]>([])
function setImageRef(i: number, el: any) {
  imagesRefs.value[i] = el
}
function scrollTo(target: number) {
  // do nothing on last image
  if (target >= list.value.length)
    return

  // jump to next page if target is the first image on each page
  if (target % pageSize.value === 0) {
    page.value += 1
    function getScrollParent(node: any): any {
      if (node == null)
        return null

      if (node.scrollHeight > node.clientHeight)
        return node

      else
        return getScrollParent(node.parentNode)
    }
    getScrollParent(root.value)?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  else { imagesRefs.value[target].scrollIntoView() }
}
</script>

<template>
  <div
    ref="root"
    flex flex-col items-center
    @dragenter="isDragging = true"
    @dragleave.capture="isDragging = false"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div
      v-if="list.length === 0"
      :class="[{ 'bg-green-500/50': isDragging }]"
      flex items-center justify-center
      text-center text-3xl
      w-full h-120
      border-4 border-dashed rounded-xl
      p-20
    >
      <div>
        <div mx-auto text-6xl i-mdi-folder-image />
        Drag & Drop folder here
        <div text-base text-gray-500:70>
          (Works only with latest Chrome&Edge)
        </div>
      </div>
    </div>
    <n-pagination
      v-if="list.length > 0"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      show-size-picker
      :page-sizes="[10, 20, 50, 100]"
      :page-slot="7"
      select-none
      :page="page + 1"
      size="large"
      mb-4
      @update:page="page = $event - 1"
    />
    <div
      v-for="data, i in filteredList"
      :key="i"
      group="~"
      flex flex-col items-center font-sans
    >
      <img
        :ref="(el) => setImageRef(i, el)"
        :src="data"
        cursor-pointer
        block
        @click="scrollTo(i + 1)"
      >
      <div text-xl mt-2 mb-4>
        {{ page * pageSize + i + 1 }}
      </div>
      <!-- <svg-divider w-80 m-4 dark:fill-current /> -->
    </div>
    <n-pagination
      v-if="list.length > 0"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      show-size-picker
      :page-sizes="[10, 20, 50, 100]"
      :page-slot="7"
      select-none
      :page="page + 1"
      size="large"
      mt-4
      @update:page="page = $event - 1"
    />
    <n-back-top />

    <n-affix absolute right-40px :top="40" :trigger-top="40" :listen-to="() => root">
      <n-button :color="isDark ? '#CDCDCD' : '#232323'" circle text-xl size="large" @click="toggleDark()">
        <div v-if="isDark" i-carbon-moon />
        <div v-else i-carbon-sun />
      </n-button>
    </n-affix>
  </div>
</template>

<style scoped>
img {
  max-width: min(80vw, 1280px);
}
</style>
