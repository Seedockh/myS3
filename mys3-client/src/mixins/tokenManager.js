import axios from 'axios'
import querystring from 'querystring'
import router from '../router.js'

export default {
  methods: {
    getToken() {
      return axios.post(
        `http://localhost:1337/checktoken`,
        querystring.stringify({ token: localStorage.token }),
        { 'Content-Type': 'application/x-www-form-urlencoded' }
      )
      .then(res => {
        if (res.data.valid)
          return localStorage.token
        this.destroyToken()
      })
      .catch(() => this.destroyToken())
    },
    createToken(token) {
      localStorage.token = token
      router.push({ name: 'home' })
    },
    destroyToken() {
      localStorage.removeItem('token')
      if (router.history.current.name !== 'login')
        router.push({ name: 'login' })
    },
  }
}
