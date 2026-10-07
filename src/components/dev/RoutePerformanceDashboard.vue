<template>
  <div
    v-if="isDev && visible"
    class="perf-dashboard"
  >
    <button
      class="perf-dashboard__toggle"
      @click="visible = !visible"
    >
      📊
    </button>
    <div
      v-if="visible"
      class="perf-dashboard__panel"
    >
      <h4>أداء المسارات</h4>
      <table class="table table--sm">
        <thead><tr><th>المسار</th><th>الوقت (ms)</th></tr></thead>
        <tbody>
          <tr
            v-for="entry in routeTimings"
            :key="entry.route"
          >
            <td>{{ entry.route }}</td>
            <td class="numeric">
              {{ entry.time }}
            </td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-muted mt-2">
        الذاكرة: {{ usedMem }} MB / {{ totalMem }} MB
      </p>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount,onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const isDev = import.meta.env.DEV
const visible = ref(false)
const routeTimings = ref([])
const usedMem = ref(0)
const totalMem = ref(0)
let observer = null

const router = useRouter()

function measureMemory() {
  if (performance.memory) {
    usedMem.value = Math.round(performance.memory.usedJSHeapSize / 1048576)
    totalMem.value = Math.round(performance.memory.jsHeapSizeLimit / 1048576)
  }
}

router.beforeEach((to, from, next) => {
  if (from.name && to.name !== from.name) {
    const start = performance.now()
    next()
    setTimeout(() => {
      const end = performance.now()
      routeTimings.value.push({
        route: `${from.name} → ${to.name}`,
        time: Math.round(end - start)
      })
      if (routeTimings.value.length > 20) routeTimings.value.shift()
    }, 0)
  } else {
    next()
  }
})

onMounted(() => {
  if (isDev) {
    measureMemory()
    observer = setInterval(measureMemory, 5000)
  }
})

onBeforeUnmount(() => {
  clearInterval(observer)
})
</script>