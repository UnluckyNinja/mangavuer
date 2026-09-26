<script setup lang="ts">
import { fileAsPromise, readDirectory } from "~/utils";
import { isDark } from "~/composables/dark";

const root = useTemplateRef("root");

type ImageItem = {
  index: number;
  blob: Blob;
};

const imageBlobs = shallowRef<ImageItem[]>([]);
const isDragging = ref(false);
const FILE_REGEX = /(.*)\.(jpg|jpeg|png|webp|avif|gif)$/;
async function processDrop(items: DataTransferItemList) {
  let directory: FileSystemDirectoryEntry | null = null;
  for (const item of items) {
    if (item.kind === "file") {
      const entry = item.webkitGetAsEntry();
      if (entry?.isDirectory) {
        directory = entry as FileSystemDirectoryEntry;
        break;
      }
    }
  }
  if (!directory) {
    console.info("No directory provided.");
    return;
  }
  // run directory code
  // revoke blob url
  const list: ImageItem[] = [];
  const entries = await readDirectory(directory);

  for (let _entry of entries) {
    if (!_entry.isFile) {
      continue;
    }
    const entry = _entry as FileSystemFileEntry;
    const filename = entry.name;
    const match = FILE_REGEX.exec(filename);
    if (!match) {
      continue;
    }
    const id = parseInt(match[1]);
    const file = await fileAsPromise(entry);
    list.push({ index: id, blob: file });
  }
  list.sort((a, b) => {
    return a.index - b.index;
  });
  imageBlobs.value = list;
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (!event.dataTransfer) return;
  event.preventDefault();
  const list = event.dataTransfer.items;
  processDrop(list);
};
const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
};

/*
 * MARK: Pagination
 */
const page = ref(0);
const pageSize = useStorage("pageSize", 100);
const pageCount = computed(() => {
  return Math.ceil(imageBlobs.value.length / pageSize.value);
});
watch(pageSize, (newVal, oldVal) => {
  page.value = Math.floor((page.value * oldVal) / newVal);
});

const filteredList = computed(() => {
  const start = page.value * pageSize.value;
  return imageBlobs.value.slice(start, start + pageSize.value);
});
const refList = useTemplateRef("refList");

function scrollTo(target: number) {
  // do nothing on last image
  if (target >= imageBlobs.value.length) return;

  // jump to next page if target is the first image on each page
  if (target % pageSize.value === 0) {
    page.value += 1;
    function getScrollParent(node: any): any {
      if (node == null) return null;

      if (node.scrollHeight > node.clientHeight) return node;
      else return getScrollParent(node.parentNode);
    }
    getScrollParent(root.value)?.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    refList.value?.[target].scrollIntoView();
  }
}
</script>

<template>
  <div
    ref="root"
    class="flex flex-col items-center"
    @dragenter="isDragging = true"
    @dragleave="isDragging = false"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div
      v-if="imageBlobs.length === 0"
      :class="[{ 'bg-green-500/50': isDragging }]"
      class="pointer-events-none flex items-center justify-center text-center text-3xl w-full h-120 border-4 border-dashed rounded-xl p-20"
    >
      <div>
        <div mx-auto text-6xl i-mdi-folder-image />
        Drag & Drop folder here
        <div text-base text-gray-500:70>(Works only with latest Chrome&Edge)</div>
      </div>
    </div>
    <n-pagination
      class="mb-4 select-none"
      v-if="imageBlobs.length > 0"
      :page="page + 1"
      :page-count="pageCount"
      :page-slot="7"
      show-size-picker
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      size="large"
      @update:page="page = $event - 1"
    />
    <div
      v-for="(data, i) in filteredList"
      ref="refList"
      :key="i"
      group="~"
      class="flex flex-col items-center font-sans"
    >
      <my-image :blob="data.blob" cursor-pointer block @click="scrollTo(i + 1)" />
      <div text-xl mt-2 mb-4>
        {{ page * pageSize + i + 1 }}
      </div>
      <!-- <svg-divider w-80 m-4 dark:fill-current /> -->
    </div>
    <n-pagination
      class="mt-4 select-none"
      v-if="imageBlobs.length > 0"
      :page="page + 1"
      :page-count="pageCount"
      :page-slot="7"
      show-size-picker
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      size="large"
      @update:page="page = $event - 1"
    />
    <n-back-top />

    <n-affix class="absolute right-40px" :top="40" :trigger-top="40" :listen-to="() => root!">
      <n-button
        :color="isDark ? '#CDCDCD' : '#232323'"
        circle
        class="text-xl"
        size="large"
        @click="toggleDark()"
      >
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
