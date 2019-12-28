<template>
  <div id="register-container">
    <h3>REGISTER</h3>
    <div class="register-form">
      <label>Nickname</label>
      <input type="text" v-model="nickname" name="nickname" required/>
      <label>Email</label>
      <input type="email" v-model="email" name="email" required/>
      <label>Password</label>
      <input type="password" v-model="password" name="password" required/>
      <p class="errorMessage" v-if="error">{{ error }}</p>
      <input type="submit" class="btn-submit" name="btn-mys3-register" value="Register" v-on:click="register()" />
      <a href="" v-on:click="goToLogin">Login</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'

export default {
  name: 'Register',
  data() {
    return { nickname: '', email: '', password: '', error: null }
  },
  methods: {
    register() {
      this.error = null

      if (this.nickname.length <= 2)
        return this.error = 'Nickname must be at least 3 characters long'

      if (this.email.length <= 2)
        return this.error = 'Email must be at least 3 characters long'

      if (!/.+@.+\..+/.test(this.email))
        return this.error = 'Email is incorrect'

      if (this.password.length <= 2)
        return this.error = 'Password must be at least 3 characters long'

      axios.post(
        // URL
        'http://localhost:1337/user/createNew',
        // BODY
        querystring.stringify({
          nickname: this.nickname,
          email: this.email,
          password: this.password
        }),
        // HEADERS
        {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      ).then( () => {
        return this.$router.push({ name: 'login' })
      }).catch( error => {
        console.log(error)
      })
    },

    goToLogin(e) {
      e.preventDefault
      return this.$router.push({ name: 'login' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h3 {
  margin: 2em 0 0 0;
}

label {
  margin-top: 1em;
  margin-bottom: .5em;
}

.register-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 1em 5em 2em 5em;
}
  .register-form input {
    border-radius: 5px;
    padding: .5em 1em;
    outline: 0;
    border: 0;
  }

.btn-submit {
  margin-top: 2em;
  background: rgba(40,58,98,.8);
  color: white;
  height: 40px;
}
  .btn-submit:hover {
    background: rgba(50,68,108,1);
  }

.errorMessage {
  color: red;
  font-size: 12px;
  text-align: right;
}

a {
  color: rgba(81,96,130,1);
  margin-top: 1.5em;
  text-align: right;
}

</style>
