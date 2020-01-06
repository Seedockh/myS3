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
      <li v-for="(folder, index) in currentFolders" @click="selected = index; selectedBucket = folder; editBucket = true" :class="{selected: index === selected}" v-bind:key="folder">
        <img src="../../assets/folder-icon.png" alt="folder picture">
        <span v-on:click="getBlobs">{{ folder }}</span>
        <img v-on:click="deleteBucket" src="../../assets/delete-icon.png" class="delete-icon" alt="folder picture">
      </li>
    </ul>
    <button type="button" name="logout" class="btn-submit" v-on:click="logout">Logout</button>
  </div>
</template>

<script>
  import axios from 'axios'
  import querystring from 'querystring'
  import swal from 'sweetalert'

  export default {
    name: 'LeftPanel',
    // mixins: [listFolders(0)],
    props: ['result'],
    data() {
      return {
        depth: 0,
        currentFolders: [],
        editBucket: false,
        selected: null,
        selectedBucket: null,
      }
    },
    mounted() {
      this.$root.$on('sendDataToLeftPanelComponent', bucket => {
        this.editBucket = false
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
            swal(error.response.data.message, {
              icon: "error",
            })
          })
        }

        if (this.depth === 1 && this.selected === null) {
          this.depth--
          this.selected = null
          this.editBucket = false
          this.$root.$emit('sendDataToFileListComponent', {
            list: null,
            userId: null,
            bucketName: null,
          })
          return this.currentFolders = []
        }

        if (this.depth === 1 && this.selected >= 0) {
          this.selected = null
          this.editBucket = false
          return this.$root.$emit('sendDataToFileListComponent', {
            list: null,
            userId: this.result.id,
            bucketName: null,
          })
        }
      },

      renameBucket(name) {
        if (name === '' || !name) return
        axios.put(
          // URL
          `http://localhost:1337/bucket/edit/${this.selectedBucket}`,
          // BODY
          querystring.stringify({
            name: name,
          }),
          // HEADERS
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${localStorage.token}`
            }
          }
        ).then( result => {
          swal(`Bucket successfully renamed to ${result.data.name} !`, {
            icon: "success",
          })
          this.depth = 0
          this.selected = null
          this.getBuckets()
        }).catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          swal(error.response.data, {
            icon: "error",
          })
        })
      },

      deleteBucket() {
        swal(
          'Are you sure you want to delete this bucket ?',
          {
            dangerMode: true,
            buttons: true,
          }
        ).then( confirm => {
          if (confirm) {
            axios.delete(
              `http://localhost:1337/bucket/delete/${this.selectedBucket}`,
              // HEADERS
              {
                headers: { 'Authorization': `Bearer ${localStorage.token}` }
              }
            ).then(() => {
              swal(`Bucket deleted successfully !`, {
                icon: "success",
              })
              this.depth = 0
              this.selected = null
              this.getBuckets()
            }).catch(error => {
              if (error.response.status === 403)
                return this.$router.push({ name: 'login' })
              return swal(error.response.data.message, { icon: "warning" })
            })
          }
        })
      },

      getBlobs(bucket) {
        if (typeof bucket === 'object')
          bucket = bucket.toElement.innerText.trim()

        // Bucket is already selected when clicked
        if (this.editBucket && bucket === this.selectedBucket) {
          swal('Rename your bucket :', {
            content: {
              element: "input",
              attributes: {
                value: bucket,
                placeholder: "Rename your bucket",
                type: "text",
              },
            },
          }).then( newName => {
            this.renameBucket(newName)
            this.editBucket = false
          })
        } else {
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

              return swal(error.response.data.message, { icon: "warning" })
          })
        }
      }
    },
  }
</script>

<style scoped>
#leftpanel-container {
  position: relative;
  width: 200px;
  min-height: 100%;
  float: left;
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
  li span:hover {
    font-size: 17px;
  }

  .delete-icon {
    position: absolute;
    right: 0;
    display: none;
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
  .selected .delete-icon {
    display: inline;
  }

.swal-modal {
  background-color: red;
}

@media screen and (max-width: 640px) {
  #leftpanel-container {
    position: inherit;
    padding: 0;
    float: left;
    width: 100%;
    min-height: 100px;
    border-radius: 7px 7px 0 0;
  }
  .leftpanel-title {
    padding: 1em;
    margin: 0;
  }
  ul {
    overflow-y: scroll;
    -ms-overflow-style: none;
  }
  ul::-webkit-scrollbar {
    display: none;
  }
  .buckets-list {
    max-height: 100px;

  }
  .btn-submit {
    height: 53px;
    background: rgba(40,58,98,1);
    border-radius: 0;
  }
}

</style>
