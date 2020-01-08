import VueRouter from 'vue-router'
import auth from './middleware/auth'
import Home from './components/Home.vue'
import Login from './components/AuthComponents/Login.vue'
import Register from './components/AuthComponents/Register.vue'

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { name: 'home', path: '/', component: Home, meta: { middleware: auth } },
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
  ]
})

function nextFactory(context, middleware, index) {
  const subsequentMiddleware = middleware[index]
  if (!subsequentMiddleware) return context.next

  return (...parameters) => {
    context.next(...parameters)
    const nextMiddleware = nextFactory(context, middleware, index + 1)
    subsequentMiddleware({ ...context, next: nextMiddleware })
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware)
      ? to.meta.middleware
      : [to.meta.middleware]
    const context = { from, next, router, to }
    const nextMiddleware = nextFactory(context, middleware, 1)

    return middleware[0]({ ...context, next: nextMiddleware })
  }
  return next()
})

export default router
