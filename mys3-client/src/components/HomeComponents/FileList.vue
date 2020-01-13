<template>
  <div id="filelist-container">
    <div v-if="list && list.files && list.files.length > 0" class="list-section">
      <div class="list-line" v-for="item in list.blobs" v-bind:key="item.id">
        <div class="list-item" @click="shareFile(item.id)">
          <p class="item-detail">{{ item.name }}</p>
          <p class="item-detail">{{ item.size/1000 }}kB</p>
        </div>
        <div class="list-buttons">
          <button type="button" v-on:click="downloadFile(item.id)" class="download-blob" name="download-blob">DOWNLOAD</button>
          <button type="button" v-on:click="duplicateFile(item.id)" class="duplicate-blob" name="duplicate-blob">DUPLICATE</button>
          <button type="button" v-on:click="deleteFile(item.id)" class="delete-blob" name="delete-blob">DELETE</button>
        </div>
      </div>
    </div>
    <div v-else-if="list && list.files && list.files.length === 0" class="list-section">
      <p class="list-information">Bucket "{{ selectedBucket }}" is empty.</p>
    </div>
    <div v-else-if="!userId" class="list-section">
      <p class="list-information">Please click on your account folder.</p>
    </div>
    <div v-else class="list-section">
      <p class="list-information">Please click on a bucket's name to list files.</p>
    </div>
    <div v-if="selectedBucket" class="upload-blob-form">
      <input type="file" ref="file" v-on:change="handleFile" name="mys3-upload" class="input-file"/>
      <button class="btn-submit" v-on:click="uploadFile" name="btn-mys3-upload">
        <img src="../../assets/upload-icon.png" alt="add file">
        Upload file
      </button>
    </div>
    <div v-if="userId" class="create-bucket-form">
      <input type="text" placeholder="Enter bucket name here..." ref="newBucket" v-on:change="handleNewBucket" name="newBucket" />
      <button class="create-bucket" v-on:click="createBucket">
        <img src="../../assets/add-icon.png" alt="add bucket">
        New bucket
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'
import swal from 'sweetalert'
import tokenManager from '../../mixins/tokenManager'

export default {
  name: 'FileList',
  mixins: [tokenManager],
  data() {
    return {
      list: null,
      userId: null,
      selectedBucket: null,
      parentBucket: null,
      file: null,
      newBucket: '',
    }
  },
  async mounted() {
    this.token = await this.getToken()
    this.$root.$on('sendDataToFileListComponent', data => {
      this.list = data.list
      this.userId = data.userId
      this.selectedBucket = data.bucketName
    })
  },
  methods: {
    handleNewBucket() {
      this.newBucket = this.$refs.newBucket.value
    },

    async shareFile(id) {
      this.token = await this.getToken()
      axios.get(
        // URL
        `http://localhost:1337/blob/share/${id}`,
        // HEADERS
        {
          headers: { 'Authorization': `Bearer ${this.token}` },
        }
      ).then( result => {
        const container = document.createElement('div')

        // This file will have READ + WRITE access
        const publicText = document.createTextNode('Public link : ')
        const publicUrl = `http://localhost:1337/blob/public/${result.data}`
        const publicLink = document.createElement('a')
        publicLink.href = publicUrl
        publicLink.innerHTML = publicUrl
        publicLink.setAttribute('download', result.data)

        const newLine = document.createElement('br')

        // This file will have only READ access
        const privateText = document.createTextNode('Private link : ')
        const privateUrl = `http://localhost:1337/blob/private/${result.data}`
        const privateLink = document.createElement('a')
        privateLink.href = privateUrl
        privateLink.innerHTML = privateUrl
        privateLink.setAttribute('download', result.data)

        container.appendChild(publicText)
        container.appendChild(publicLink)
        container.appendChild(newLine)
        container.appendChild(privateText)
        container.appendChild(privateLink)

        swal({
          title: "Share links :",
          content: container,
        })
      }).catch( error => {
          return swal(error.response.data.message, { icon: "warning" })
      })
    },

    /**
     * @implements Optimistic UI
     */
    async createBucket() {
      this.token = await this.getToken()
      if (!this.newBucket) return swal(`No name specified !`, { icon: "warning" })
      if (this.selectedBucket) this.parentBucket = this.selectedBucket
      this.newBucket = this.newBucket.replace(/ /g, '-')

      // OPTIMISTIC DATA SENT FOR NEW BUCKET
      this.$root.$emit('sendDataToLeftPanelComponent', { new: this.newBucket })

      axios.post(
        // URL
        `http://localhost:1337/bucket/createNew`,
        // BODY
        querystring.stringify({
          name: this.newBucket,
          parent: this.parentBucket,
        }),
        // HEADERS
        { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.token}`
          }
        }).then( () => {
          // NOTHING MORE TO DO HERE BECAUSE OPTIMISM :)
          swal(`Bucket ${this.newBucket} created successfully !`, {
            icon: "success",
          })
        })
        .catch( error => {
          // LEFT PANEL WILL UPDATE ACCORDING TO THE DB SO NOTHING MORE TO SEND HERE
          if (/duplicate key value violates unique constraint/g.test(error.response.data.message))
            return swal('Bucket with this name already exists !', { icon: "warning" })

          return swal(error.response.data.message, { icon: "warning" })
        })
    },

    handleFile() {
      this.file = this.$refs.file.files[0]
    },

    async uploadFile() {
      this.token = await this.getToken()
      if (!this.file) return swal(`No file selected !`, { icon: "warning" })
      const formData = new FormData()
      formData.append('mys3-upload', this.file)

      axios.post(
        // URL
        `http://localhost:1337/blob/add/${this.selectedBucket}`,
        // BODY
        formData,
        // HEADERS
        { headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.token}`
          }
        }).then( result => {
          swal(`File ${result.data.name} uploaded successfully !`, {
            icon: "success",
          })
          this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
        })
        .catch( error => {
          return swal(error.response.data.message, { icon: "warning" })
        })
    },

    async downloadFile(id) {
      this.token = await this.getToken()
      axios.get(
        // URL
        `http://localhost:1337/blob/retrieve/${id}`,
        // HEADERS
        {
          headers: { 'Authorization': `Bearer ${this.token}` },
          responseType: 'arraybuffer',
        }
      ).then( result => {
        axios.get(
          // URL
          `http://localhost:1337/blob/getInfos/${id}`,
          // HEADERS
          {
            headers: { 'Authorization': `Bearer ${this.token}` },
          }
        ).then( blobInfos => {
          const url = window.URL.createObjectURL(new Blob([result.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', blobInfos.data.name)
          document.body.appendChild(link)
          link.click()
        }).catch( error => {
            return swal(error.response.data.message, { icon: "warning" })
        })
      }).catch( error => {
          return swal(error.response.data.message, { icon: "warning" })
      })
    },

    async duplicateFile(id) {
      this.token = await this.getToken()
      axios.post(
        // URL
        `http://localhost:1337/blob/duplicate/${id}`,
        {},
        // HEADERS
        { headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }).then( result => {
          swal(`File ${result.data.name} successfully created !`, {
            icon: "success",
          })
          this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
        })
        .catch( error => {
          return swal(error.response.data.message, { icon: "warning" })
        })
    },

    async deleteFile(id) {
      this.token = await this.getToken()
      swal(
        'Are you sure you want to delete this file ?',
        {
          dangerMode: true,
          buttons: true,
        }
      ).then( confirm => {
        if (confirm) {
          axios.delete(
            `http://localhost:1337/blob/delete/${id}`,
            // HEADERS
            {
              headers: { 'Authorization': `Bearer ${this.token}` }
            }
          ).then(() => {
            swal(`File deleted successfully !`, {
              icon: "success",
            })
            this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
          }).catch(error => {
            return swal(error.response.data.message, { icon: "warning" })
          })
        }
      })
    },
  }
}

</script>

<style scoped>
#filelist-container {
  width: 90%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2em;
}

.list-section {
  position: relative;
  width: 100%;
  max-height: 350px;
  overflow-y: scroll;
  -ms-overflow-style: none;
}
.list-section::-webkit-scrollbar {
  display: none;
}
  .list-section .list-information {
    font-size: 20px;
    color: grey;
    text-align: center;
  }

  .list-line {
    width: 90%;
    padding: .5em;
    margin-bottom: .3em;
    border-radius: 3px;
    display: flex;
    justify-content: space-around;
  }
    .list-line:nth-child(odd) {
      background: rgba(40,58,98,.6);
    }
    .list-line:nth-child(even) {
      background: rgba(81,96,130,.6);
    }
    .list-line:hover {
        background: rgba(75,75,75,.5);
        cursor: pointer;
    }

  .list-line .list-item {
    width: 80%;
    cursor: grab;
  }
    .item-detail {
      text-align: center;
    }

  .list-line .list-buttons {
    display: flex;
    flex-direction: column;
    width: 20%;
    justify-content: space-around;
    align-items: flex-end;
  }

  .download-blob, .duplicate-blob, .delete-blob {
    height: 25px;
    width: 100%;
    color: white;
    font-size: 11px;
    border-radius: 5px;
    border-width: 1px;
    border-color: rgba(75,75,75,1);
    outline: 0;
    cursor: pointer;
  }
  .list-line .download-blob {
    background: #005073;
  }
  .list-line .duplicate-blob {
    background: #107dac;
  }
  .list-line .delete-blob {
    background: #1d136a;
  }

.upload-blob-form {
  width: 90%;
  margin-top: 1em;
  display: flex;
  justify-content: space-around;
}
  .upload-blob-form input {
    width: 100%;
    height: 22px;
    padding: .3em 1em .3em 1em;
    border: 2px solid grey;
    cursor: pointer;
    border-radius: 5px;
    color: grey;
    background-color: white;
  }

  .upload-blob-form .btn-submit img {
    width: 25px;
    margin-right: .5em;
  }

.create-bucket-form {
  width: 90%;
  margin-top: .5em;
  display: flex;
  justify-content: space-around;
}
.create-bucket-form input {
  width: 100%;
  padding-left: 1em;
  border-radius: 5px;
}
.create-bucket, .btn-submit {
  min-width: 140px;
  display: flex;
  margin-left: .5em;
  align-items: center;
  justify-content: center;
  background: rgba(40,58,98,.8);
  border-radius: 5px;
  height: 34px;
  padding: 0 1em 0 1em;
  cursor: pointer;
  color: white;
}
  .create-bucket img {
    width: 25px;
    margin-right: .5em;
  }

@media screen and (max-width: 767px) {
  #filelist-container {
    width: 100%;
    padding: 1em;
  }
  .list-section {
    width: 100%;
  }
    .list-section .list-line {
      width: 100%;
    }
      .list-line .list-buttons {
        width: 30%;
        margin-right: .5em;
      }
  .create-bucket-form, .upload-blob-form {
    width: 100%;
  }
}

@media screen and (max-width: 640px) {
  #filelist-container {
    width: 100%;
    padding: 1em 0;
    max-height: 50%;
  }
  .list-section, .create-bucket-form, .upload-blob-form {
    max-width: 100%;
  }
  .list-line {
    max-width: 97%;
  }
  .list-line .list-buttons {
    width: 20%;
    margin-right: .5em;
  }
}

</style>
