<script setup>
import zhCn from "element-plus/lib/locale/lang/zh-cn";
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view/>
  </el-config-provider>
</template>

<style scoped>
</style>
