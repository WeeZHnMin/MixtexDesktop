<template>
  <div class="sidebar">
    <router-link to="/">主 页</router-link>
    <router-link to="/info">关 于</router-link>
  </div>
</template>

<style>
.sidebar {
  flex: 0 0 25%;       /* 默认宽度 */
  max-width: 300px;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin: 5px;
  margin-left: 5px;
  font-size: 22px;      /* 字体大小 */
  font-family: 'Arial', sans-serif; /* 字体样式 */
  font-weight: bold;    /* 字体粗细 */
}

.sidebar a {
  margin: 10px 0;
  text-decoration: none;
  color: #333;
  display: block;       /* 每项独占一行 */
}

.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>
