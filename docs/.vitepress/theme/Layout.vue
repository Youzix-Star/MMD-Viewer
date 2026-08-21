<script setup>
import DefaultTheme from 'vitepress/theme'
import Twikoo from './components/Twikoo.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-after>
      <Twikoo></Twikoo>
    </template>
  </Layout>
</template>

<style>
.twikoo .el-loading-spinner .circular {
  margin-left: auto;
  margin-right: auto;
}
</style>
