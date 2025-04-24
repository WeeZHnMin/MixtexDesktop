// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Info from './views/Info.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/info', component: Info },
  { path: '/settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
