<template>
  <div id="home-container">
    <LeftPanel :result='this.user'/>
    <FileList :result='this.user'/>
  </div>
</template>

<script>
import axios from 'axios'
import LeftPanel from './HomeComponents/LeftPanel.vue'
import FileList from './HomeComponents/FileList.vue'
import tokenManager from '../mixins/tokenManager'

export default {
  name: 'Home',
  components: {
    LeftPanel,
    FileList,
  },
  mixins: [tokenManager],
  data() {
    return { user: { id: null, nickname: null, email: null }, token: null }
  },
  async mounted() {
    this.token = await this.getToken()
    axios.get(
      // URL
      'http://localhost:1337/user/get',
      // HEADERS
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    ).then( (result) => {
      this.user = {
        id: result.data.id,
        nickname: result.data.nickname,
        email: result.data.email
      }
    }).catch( () => {
      return this.$router.push({ name: 'login' })
    })
  }
}
</script>

<style scoped>
#home-container {
  display: flex;
  align-items: flex-start;
  height: 100%;
}

@media screen and (max-width: 640px) {
  #home-container {
    min-height: 100%;
    flex-direction: column;
  }
}
</style>
