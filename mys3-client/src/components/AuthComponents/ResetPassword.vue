<template>
  <div id="reset-password-container">
    <div class="reset-form">
      <h3>Reset password</h3>
      <label>Email</label>
      <input type="text" v-model="email" name="email" />
      <p class="errorMessage" v-if="error">{{ error }}</p>
      <p class="successMessage" v-if="success">{{ success }}</p>
      <input type="submit" class="btn-submit" name="btn-mys3-reset-password" value="Send" v-on:click="resetPassword()" />
      <a href="" v-on:click="goToRegister">Create account</a>
      <a href="" v-on:click="goToLogin">Login</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'
import tokenManager from '../../mixins/tokenManager'

export default {
  name: 'ResetPassword',
  mixins: [tokenManager],
  props: {
    reloadToken: { type: Function }
  },
  data() {
    return { email: '', error: null, success: null }
  },
  methods: {
    resetPassword() {
      this.error = undefined
      if (!/.+@.+\..+/.test(this.email))
        return this.error = `Email is incorrect`

      axios.put(
        // URL
        'http://localhost:1337/user/generatePwMail',
        // BODY
        querystring.stringify({
          email: this.email
        }),
        // HEADERS
        {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      ).then(() => {
        this.success = `Email successfully sent to your mailbox !`
      }).catch( error => {
        this.error = error.response.data.message
      })
    },

    goToRegister(e) {
      e.preventDefault
      return this.$router.push({ name: 'register' })
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
#reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

label {
  margin-top: 1em;
  margin-bottom: .5em;
}

.reset-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 1em 5em 3em 5em;
}
  h3 {
    text-align: center;
  }
  .reset-form input {
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

.successMessage {
  color: green;
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
