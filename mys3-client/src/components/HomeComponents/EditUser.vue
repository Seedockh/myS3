<template>
  <div id="edituser-container">
    <h3>User informations :</h3>
    <input type="text" name="nickname" v-model="nickname" placeholder="Nickname">
    <input type="text" name="email" v-model="email" placeholder="Nickname">
    <input type="password" name="oldPassword" placeholder="Old password" v-model="oldPassword">
    <input type="password" name="newPassword" placeholder="New password" v-model="newPassword">
    <input type="password" name="newPasswordConfirm" placeholder="New password confirmation" v-model="newPasswordConfirm">
    <button class="btn-submit" v-on:click="handleEdit" name="btn-mys3-edituser">Update</button>
  </div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'
import swal from 'sweetalert'
import tokenManager from '../../mixins/tokenManager'

export default {
  name: 'EditUser',
  mixins: [tokenManager],
  props: ['user'],
  data() {
    return {
      token: null,
      nickname: this.user.nickname,
      email: this.user.email,
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    }
  },
  async mounted() { },
  methods: {
    async handleEdit() {
      this.token = await this.getToken()
      let data = { }
      if (this.nickname !== this.user.nickname) {
        if (this.nickname.length < 3)
          return swal(`Nickname must be 3 characters long`, {
            icon: "warning",
          })
        data.nickname = this.nickname
      }

      if (this.email !== this.user.email) {
        if (!/.+@.+\..+/.test(this.email))
          return swal(`Email is incorrect`, {
            icon: "warning",
          })
        data.email = this.email
      }

      if (this.newPassword.length > 0) {
        if (this.oldPassword.length > 0) {
          const isValid = await this.checkPassword()
          if (isValid.data) {
            if (this.newPassword.length < 3)
              return swal(`Password must be 3 characters long`, {
                icon: "warning",
              })

            if (this.newPassword !== this.newPasswordConfirm)
              return swal(`Password confirmation is wrong`, {
                icon: "warning",
              })
            data.password = this.newPassword
          } else {
            return swal(`Old password is wrong !`, {
              icon: "warning",
            })
          }
        } else {
          return swal(`Old password is required !`, {
            icon: "warning",
          })
        }
      }

      await this.editUser(data)
      if (this.oldPassword.length > 0 && this.newPassword.length > 0) this.destroyToken()
    },

    async checkPassword() {
      this.token = await this.getToken()
      return await axios.post(
        // URL
        `http://localhost:1337/user/checkPassword`,
        // BODY
        querystring.stringify({ password: this.oldPassword }),
        // HEADERS
        { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.token}`
          }
        })
    },

    async editUser(data) {
      axios.put(
        // URL
        `http://localhost:1337/user/edit`,
        // BODY
        querystring.stringify(data),
        // HEADERS
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.token}`
          }
        }
      ).then( result => {
        this.$root.$emit('updateUserInfos', result.data)
        return swal(`User successfully updated !`, {
          icon: "success",
        })
      }).catch( error => {
        return swal(error.response.data, {
          icon: "error",
        })
      })
    },
  }
}

</script>

<style scoped>
#edituser-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
  #edituser-container input {
    width: 50%;
    margin: .5em 0;
    border-radius: 5px;
    padding: .5em;
  }

.btn-submit {
  width: 53%;
  background: rgba(40,58,98,.8);
  border-radius: 5px;
  padding: .5em;
  cursor: pointer;
  color: white;
  margin-top: .5em;
}
</style>
