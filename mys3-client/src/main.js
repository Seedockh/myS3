import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSnackbar from 'vue-snack'
import router from './router'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(VueSnackbar, { position: 'top-right', time: 3000, close: true })

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
