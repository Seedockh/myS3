<template>
  <div id="login-container">
    <div class="login-form">
      <h3>Login</h3>
      <label>Nickname</label>
      <input type="text" v-model="nickname" name="nickname" />
      <label>Password</label>
      <input type="password" v-model="password" name="password" />
      <p class="errorMessage" v-if="error">{{ error }}</p>
      <input type="submit" class="btn-submit" name="btn-mys3-login" value="Login" v-on:click="login()" />
      <a href="" v-on:click="goToRegister">Create account</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'

export default {
  name: 'Login',
  props: {
    reloadToken: { type: Function }
  },
  data() {
    return { nickname: '', password: '', error: undefined }
  },
  methods: {
    login() {
      this.error = undefined
      axios.post(
        // URL
        'http://localhost:1337/auth/login',
        // BODY
        querystring.stringify({
          nickname: this.nickname,
          password: this.password
        }),
        // HEADERS
        {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      ).then( result => {
        localStorage.token = result.data.token
        return this.$router.push({ name: 'home' })
      }).catch( error => {
        this.error = error.response.data.message
      })
    },

    goToRegister(e) {
      e.preventDefault
      return this.$router.push({ name: 'register' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#login-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

label {
  margin-top: 1em;
  margin-bottom: .5em;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 1em 5em 3em 5em;
}
  h3 {
    text-align: center;
  }
  .login-form input {
    border-radius: 5px;
    padding: .5em 1em;
    outline: 0;
    border: 0;
  }

.errorMessage {
  color: red;
  font-size: 12px;
  text-align: right;
}

.btn-submit {
  margin-top: 1em;
  background: rgba(40,58,98,.8);
  color: white;
  height: 40px;
}
  .btn-submit:hover {
    background: rgba(50,68,108,1);
  }

a {
  color: rgba(81,96,130,1);
  margin-top: 1.5em;
  text-align: right;
}

</style>
