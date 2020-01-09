import Vue from 'vue'
import VueRouter from 'vue-router'
import router from './router'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueRouter)

export function createApp() {
  const app = new Vue({
    router,
    render: h => h(App),
  })
  return { app, router }
}
