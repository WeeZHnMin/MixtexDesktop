<!-- /src/App.vue -->
<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<!-- ✅ 这里是局部样式 -->
<style scoped>
.layout {
  display: flex;
  height: 100%;
}

.main-content {
  display: flex;
  width: 100%;
  height: 100%;
  margin-right: 0
}
</style>

<!-- ✅ 这里是全局样式，不加 scoped -->
<style>
html, body {
  display: flex;
  overflow: hidden; /* 禁止滚动条 */
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  justify-content: center; /* 垂直居中 */
  padding-bottom: 25px; /* 底部留出空间 */
  box-sizing: border-box;         /* 👈 ensures padding is inside total height */
  margin: 0;                      /* margin won't work due to overflow hidden */
  margin-top: 0px;
  margin-right: 5px;
}

</style>
