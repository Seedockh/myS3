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

export default {
  name: 'Home',
  components: {
    LeftPanel,
    FileList,
  },
  data() {
    return { user: { id: null, nickname: null, email: null } }
  },
  mounted() {
    axios.get(
      // URL
      'http://localhost:1337/user/get',
      // HEADERS
      {
        headers: { 'Authorization': `Bearer ${localStorage.token}` }
      }
    ).then( (result) => {
      this.user = {
        id: result.data.id,
        nickname: result.data.nickname,
        email: result.data.email
      }
    }).catch( error => {
      console.log(error.response.data.message)
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
    flex-direction: column;
  }
}
</style>
