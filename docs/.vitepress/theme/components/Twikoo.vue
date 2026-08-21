<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const envId = 'https://youzix.dpdns.org/.netlify/functions/twikoo'
const router = useRouter()
let twikooMod = null

function initTwikoo() {
  if (!twikooMod) return
  try { twikooMod.init({ envId }) } catch (e) {}
}

function onRoute(to) {
  if (to) setTimeout(initTwikoo, 1000)
}

onMounted(async () => {
  if (typeof window === 'undefined') return
  twikooMod = await import('twikoo')
  initTwikoo()
  router.onAfterRouteChange = onRoute
})
</script>

<template>
  <div class="comment-container vp-raw">
    <div id="twikoo"></div>
  </div>
</template>
