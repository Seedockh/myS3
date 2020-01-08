<template>
  <div id="filelist-container">
    <div v-if="list && list.files && list.files.length > 0" class="list-section">
      <div class="list-line" v-for="item in list.blobs" v-bind:key="item.id">
        <div class="list-item">
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
        Upload a file
      </button>
    </div>
    <div v-if="userId && !selectedBucket" class="create-bucket-form">
      <input type="text" placeholder="Enter bucket name here..." ref="newBucket" v-on:change="handleNewBucket" name="newBucket" />
      <button class="create-bucket" v-on:click="createBucket">
        <img src="../../assets/add-icon.png" alt="add bucket">
        Create a new bucket
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import querystring from 'querystring'
import swal from 'sweetalert'

export default {
  name: 'FileList',
  data() {
    return {
      list: null,
      userId: null,
      selectedBucket: null,
      file: null,
      newBucket: '',
    }
  },
  mounted() {
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

    createBucket() {
      if (!this.newBucket) return swal(`No name specified !`, { icon: "warning" })

      this.newBucket = this.newBucket.replace(/ /g, '-')

      axios.post(
        // URL
        `http://localhost:1337/bucket/createNew`,
        // BODY
        querystring.stringify({ name: this.newBucket }),
        // HEADERS
        { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${localStorage.token}`
          }
        }).then( () => {
          swal(`Bucket ${this.newBucket} created successfully !`, {
            icon: "success",
          })
          this.$root.$emit('sendDataToLeftPanelComponent', { new: this.newBucket })
        })
        .catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          if (/duplicate key value violates unique constraint/g.test(error.response.data.message))
            return swal('Bucket with this name already exists !', { icon: "warning" })

          return swal(error.response.data.message, { icon: "warning" })
        })
    },

    handleFile() {
      this.file = this.$refs.file.files[0]
    },

    uploadFile() {
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
            'Authorization': `Bearer ${localStorage.token}`
          }
        }).then( result => {
          swal(`File ${result.data.name} uploaded successfully !`, {
            icon: "success",
          })
          this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
        })
        .catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          return swal(error.response.data.message, { icon: "warning" })
        })
    },

    downloadFile(id) {
      axios.get(
        // URL
        `http://localhost:1337/blob/retrieve/${id}`,
        // HEADERS
        {
          headers: { 'Authorization': `Bearer ${localStorage.token}` },
          responseType: 'arraybuffer',
        }
      ).then( result => {
        axios.get(
          // URL
          `http://localhost:1337/blob/getInfos/${id}`,
          // HEADERS
          {
            headers: { 'Authorization': `Bearer ${localStorage.token}` },
          }
        ).then( blobInfos => {
          const url = window.URL.createObjectURL(new Blob([result.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', blobInfos.data.name)
          document.body.appendChild(link)
          link.click()

        }).catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

            return swal(error.response.data.message, { icon: "warning" })
        })
      }).catch( error => {
        if (error.response.status === 403)
          return this.$router.push({ name: 'login' })

          return swal(error.response.data.message, { icon: "warning" })
      })
    },
    duplicateFile(id) {
      axios.post(
        // URL
        `http://localhost:1337/blob/duplicate/${id}`,
        {},
        // HEADERS
        { headers: {
            'Authorization': `Bearer ${localStorage.token}`
          }
        }).then( result => {
          swal(`File ${result.data.name} successfully created !`, {
            icon: "success",
          })
          this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
        })
        .catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          return swal(error.response.data.message, { icon: "warning" })
        })
    },
    deleteFile(id) {
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
              headers: { 'Authorization': `Bearer ${localStorage.token}` }
            }
          ).then(() => {
            swal(`File deleted successfully !`, {
              icon: "success",
            })
            this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
          }).catch(error => {
            if (error.response.status === 403)
              return this.$router.push({ name: 'login' })
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
    width: 250px;
    padding: 1em 0 1em 1em;
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
  margin-top: 2em;
  display: flex;
  justify-content: space-around;
}
.create-bucket-form input {
  width: 250px;
  padding-left: 1em;
  border-radius: 5px;
}
.create-bucket, .btn-submit {
  width: 35%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(40,58,98,.8);
  border-radius: 5px;
  padding: .5em;
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
