<template>
  <div class="sidebar">
    <router-link to="/">主页</router-link>
    <router-link to="/info">信息</router-link>
    <router-link to="/settings">设置</router-link>
  </div>
</template>

<style scoped>
.sidebar {
  width: 25%;                 
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
}

.sidebar a {
  margin: 10px 0;
  text-decoration: none;
  color: #333;
}

.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>
