<template>
  <div id="leftpanel-container">
    <p class="leftpanel-title">{{ this.result.nickname }}</p>
    <ul class="userid">
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

      /**
       * @implements Optimistic UI
       */
      renameBucket(name) {
        if (name === '' || !name) return
        name = name.replace(/ /g, '-')

        // OPTIMISTIC RENAME
        this.currentFolders[this.currentFolders.indexOf(this.selectedBucket)] = name
        const optimisticName = this.currentFolders[this.currentFolders.indexOf(this.selectedBucket)]
        this.getBuckets()

        // FETCHING REAL DATA
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
          // IF PREDICTION WAS TRUE
          if (result.data.name !== optimisticName) {
            swal(`Bucket successfully renamed to ${result.data.name} !`, {
              icon: "success",
            })
          } else {
            // IF NAME HAS BEEN FORMATTED
            swal(`Bucket successfully renamed, but to ${result.data.name} !`, {
              icon: "warning",
            })
            this.getBuckets()
          }
        }).catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          swal(error.response.data, {
            icon: "error",
          })
        })
      },

      /**
       * @implements Optimistic UI
       */
      deleteBucket() {
        swal(
          'Are you sure you want to delete this bucket ?',
          {
            dangerMode: true,
            buttons: true,
          }
        ).then( confirm => {
          if (confirm) {
            // OPTIMISTIC DELETE
            const bucketsBackup = this.currentFolders
            this.currentFolders.splice(this.currentFolders.indexOf(this.selectedBucket), 1)
            this.getBuckets()

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
            }).catch(error => {
              if (error.response.status === 403)
                return this.$router.push({ name: 'login' })

              // OPTIMISTIC FAILED
              this.currentFolders = bucketsBackup
              this.getBuckets()
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
  width: 300px;
  min-height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,1);
  padding: 0;
  border-radius: 7px 0 0 7px;
  border-bottom: 1px solid #193d63;
  border-right: 1px solid #193d63;
}

.userid {
  margin: 0;
  border-bottom: 1px solid #193d63;
  cursor: pointer;
  min-height: 50px;
}

.leftpanel-title {
  background: rgba(11,156,49,0.7);
  font-weight: bold;
  border-bottom: 1px solid #193d63;
  padding: 1em;
  margin-top: 0;
  border-radius: 7px 0 0 0;
  text-align: center;
}

ul {
  list-style: none;
}

li {
  width: 100%;
  margin-left: -2em;
  margin-bottom: .5em;
  padding: .5em .5em;
  border-radius: 3px;
  white-space: pre-line;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}
  .buckets-list li:hover {
    background: rgba(50,68,108,1);
  }
  li img {
    width: 10px;
    height: 10px;
    margin-right: .5em
  }
  li span {
    cursor: pointer;
    position: absolute;
    padding-left: 1.7em;
    left: 0;
    width: 90%;
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
  margin-bottom: 3.5em;
  max-height: 100%;
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

@media screen and (max-with: 767px) {
  #leftpanel-container {
    width: 200px;
  }
}

@media screen and (max-width: 640px) {
  #leftpanel-container {
    position: inherit;
    padding: 0;
    width: 100%;
    min-height: 0;
    max-height: 250px;
    border-radius: 7px 7px 0 0;
    border-right: 0;
  }
  .leftpanel-title {
    padding: 1em;
    margin: 0;
    border-radius: 0;
    border: 0;
  }
  .userid {
    padding-top: 1em;
  }
  ul {
    overflow-y: scroll;
    -ms-overflow-style: none;
  }
  ul::-webkit-scrollbar {
    display: none;
  }
  .buckets-list {
    max-height: 100%;
    margin-bottom: 1em;
  }
  .btn-submit {
    height: 53px;
    background: rgba(40,58,98,1);
    border-radius: 0;
  }
}

</style>
