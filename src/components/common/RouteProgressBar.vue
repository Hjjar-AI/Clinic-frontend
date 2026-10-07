<template>
  <div
    class="route-progress-bar"
    :class="{ active: show }"
    :style="{ width: progress + '%' }"
  />
</template>

<script setup>
import { onBeforeUnmount,onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const progress = ref(0)
const show = ref(false)
let timer = null

function start() {
  show.value = true
  progress.value = 0
  clearInterval(timer)
  timer = setInterval(() => {
    if (progress.value < 70) progress.value += 10
    else if (progress.value < 90) progress.value += 3
  }, 200)
}

function finish() {
  clearInterval(timer)
  timer = null
  progress.value = 100
  setTimeout(() => {
    show.value = false
    progress.value = 0
  }, 400)
}

// FIX: keep the router hook handles so we can unregister on unmount.
// Otherwise a remount of this component would register the guards twice.
let removeBefore = null
let removeAfter = null

onMounted(() => {
  removeBefore = router.beforeEach((to, from, next) => { start(); next() })
  removeAfter = router.afterEach(() => { finish() })
})

onBeforeUnmount(() => {
  clearInterval(timer)
  timer = null
  if (removeBefore) removeBefore()
  if (removeAfter) removeAfter()
})
</script>