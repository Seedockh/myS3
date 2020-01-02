<template>
  <div id="leftpanel-container">
    <p class="leftpanel-title">Logged in as : {{ this.result.nickname }}</p>
    <ul>
      <li v-on:click="getBuckets">
        <img src="../../assets/folder-icon.png" alt="folder picture">
        {{ this.result.id }}
      </li>
    </ul>
    <ul class="buckets-list" v-if="depth>=1">
      <li v-for="(folder, index) in currentFolders" @click="selected = index" v-on:click="getBlobs" :class="{selected: index === selected}" v-bind:key="folder">
        <img src="../../assets/folder-icon.png" alt="folder picture">
        {{ folder }}
        <img src="../../assets/delete-icon.png" class="delete-icon" alt="folder picture">
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
      return {
        depth: 0,
        error: undefined,
        currentFolders: [],
        selected: null,
      }
    },
    mounted() {
      this.$root.$on('sendDataToLeftPanelComponent', bucket => {
        if (bucket.new)
          return this.getBuckets()

        this.getBlobs(bucket)
      })
    },
    methods: {
      logout() {
        localStorage.removeItem('token')
        this.$router.push({ name: 'login' })
      },

      getBuckets() {
        this.error = undefined
        if (this.depth === 0) {
          axios.get(
            // URL
            'http://localhost:1337/user/getBuckets',
            // HEADERS
            {
              headers: { 'Authorization': `Bearer ${localStorage.token}` }
            }
          ).then( result => {
            this.depth++
            this.$root.$emit('sendDataToFileListComponent', {
              list: null,
              userId: this.result.id,
              bucketName: null,
            })
            return this.currentFolders = result.data.list
          }).catch( error => {
            if (error.response.status === 403)
              return this.$router.push({ name: 'login' })
            this.error = error.response.data.message
          })
        }

        if (this.depth === 1 && this.selected === null) {
          this.depth--
          this.selected = null
          this.$root.$emit('sendDataToFileListComponent', {
            list: null,
            userId: null,
            bucketName: null,
          })
          return this.currentFolders = []
        }

        if (this.depth === 1 && this.selected >= 0) {
          this.selected = null
          return this.$root.$emit('sendDataToFileListComponent', {
            list: null,
            userId: this.result.id,
            bucketName: null,
          })
        }
      },

      getBlobs(bucket) {
        this.error = undefined
        if (typeof bucket === 'object')
          bucket = bucket.toElement.innerText.trim()
        axios.get(
          // URL
          `http://localhost:1337/bucket/listFiles/${bucket}`,
          // HEADERS
          {
            headers: { 'Authorization': `Bearer ${localStorage.token}` }
          }
        ).then( result => {
          return this.$root.$emit('sendDataToFileListComponent', {
            list: result.data,
            userId: this.result.id,
            bucketName: bucket,
          })
        }).catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

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
  width: 100%;
  margin-left: -2em;
  padding: .3em .5em;
  border-radius: 3px;
  white-space: pre-line;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}
  li img {
    width: 10px;
    height: 10px;
    margin-right: .5em
  }
  .delete-icon {
    position: absolute;
    right: 0;
  }

.buckets-list {
  margin-left: 1em;
  max-height: 50%;
  overflow: scroll;
    -ms-overflow-style: none;
  }
.buckets-list::-webkit-scrollbar {
  display: none;
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

.selected {
  background: rgba(50,68,108,1);
  text-shadow: 2px 2px 3px black;
}
  .selected img {
    box-shadow: 1px 1px 2px black;
  }

@media screen and (max-width: 640px) {
  #leftpanel-container {
    width: 90%;
    height: 400px;
  }
  .leftpanel-title {
    margin-top: 1em;
  }
  ul {
    max-height: 100px;
    overflow: scroll;
  }
}

</style>
