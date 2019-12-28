<template>
  <div id="leftpanel-container">
    <p class="leftpanel-title">Logged in as : {{ this.result.nickname }}</p>
    <ul>
      <li v-on:click="getBuckets">
        <img src="../../assets/folder-icon.png" alt="folder picture">
        {{ this.result.id }}
        <ul v-if="depth>=1">
          <li v-on:click="getBlobs" v-for="folder in currentFolders" v-bind:key="folder">
            <img src="../../assets/folder-icon.png" alt="folder picture">
            {{ folder }}
          </li>
        </ul>
      </li>
    </ul>
    <button type="button" name="logout" class="btn-submit" v-on:click="logout">Logout</button>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'LeftPanel',
    // mixins: [listFolders(0)],
    props: ['result'],
    data() {
      return { depth: 0, error: undefined, currentFolders: [] }
    },
    methods: {
      logout() {
        localStorage.removeItem('token')
        this.$router.push({ name: 'login' })
      },

      getBuckets() {
        this.error = undefined
        axios.get(
          // URL
          'http://localhost:1337/user/getBuckets',
          // HEADERS
          {
            headers: { 'Authorization': `Bearer ${localStorage.token}` }
          }
        ).then( result => {
          this.depth++
          return this.currentFolders = result.data.list
        }).catch( error => {
          this.error = error.response.data.message
        })
      },

      getBlobs() {
        this.error = undefined
        axios.get(
          // URL
          'http://localhost:1337/bucket/listFiles/',
          // HEADERS
          {
            headers: { 'Authorization': `Bearer ${localStorage.token}` }
          }
        ).then( result => {
          this.depth++
          return this.currentFolders = result.data.list
        }).catch( error => {
          this.error = error.response.data.message
        })
      }
    },
  }
</script>

<style scoped>
#leftpanel-container {
  position: relative;
  width: 200px;
  height: 100%;
  background: rgba(25,25,25,1);
  padding: 0 1em 0 1em;
  border-radius: 7px 0 0 7px;
}

.leftpanel-title {
  font-weight: bold;
  border-bottom: 1px solid #193d63;
  padding-bottom: .5em;
  margin-top: 3em;
}

ul {
  list-style: none;
}

li {
  margin-left: -2em;
  margin-bottom: .5em;
  white-space: pre-line;
  cursor: pointer;
}
  li img {
    width: 10px;
    margin-right: .5em
  }

  li ul {
    margin-top: 1em;
  }


.btn-submit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(40,58,98,.8);
  color: white;
  width: 100%;
  height: 40px;
  border-radius: 0 0 0 5px;
  padding: .5em 1em;
  outline: 0;
  border: 0;
}
  .btn-submit:hover {
    background: rgba(50,68,108,1);
    cursor: pointer;
  }

@media screen and (max-width: 640px) {
  #leftpanel-container {
    width: 90%;
    height: 200px;
  }
  ul {
    max-height: 100px;
    overflow: scroll;
  }
}

</style>
