<template>
  <div id="filelist-container">
    <div v-if="list && list.length > 0" class="list-section">
      <div class="list-line" v-for="item in list" v-bind:key="item">
        <div class="list-item">{{ item }}</div>
        <button type="button"  v-on:click="downloadFile" class="download-blob" name="download-blob">DL</button>
        <button type="button"  v-on:click="editFile" class="edit-blob" name="edit-blob">EDIT</button>
        <button type="button"  v-on:click="deleteFile" class="delete-blob" name="delete-blob">DELETE</button>
      </div>
    </div>
    <div v-else-if="list && list.length === 0" class="list-section">
      <p>Bucket "{{ selectedBucket }}" is empty.</p>
    </div>
    <div v-else-if="!userId" class="list-section">
      <p>Please click on your account folder.</p>
    </div>
    <div v-else class="list-section">
      <p>Please click on a bucket to list files.</p>
    </div>
    <p class="success" v-if="success">{{ success }}</p>
    <p class="error" v-if="error">{{ error }}</p>
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

export default {
  name: 'FileList',
  data() {
    return {
      list: null,
      userId: null,
      selectedBucket: null,
      file: null,
      newBucket: '',
      error: null,
      success: null,
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
      this.success = null
      this.error = null
      if (!this.newBucket) return this.error = `No name specified !`
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
          this.success = `Bucket ${this.newBucket} created successfully !`
          setTimeout(() => { return this.success = null }, 3000)
          this.$root.$emit('sendDataToLeftPanelComponent', { new: this.newBucket })
        })
        .catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          this.error = error.response.data.message
          setTimeout(() => { return this.error = null }, 3000)
        })
    },

    handleFile() {
      this.file = this.$refs.file.files[0]
    },

    uploadFile() {
      this.success = null
      this.error = null
      const formData = new FormData()
      formData.append('mys3-upload', this.file)
      if (!this.file) return this.error = `No file selected !`
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
          this.success = `File ${result.data.name} uploaded successfully !`
          setTimeout(() => { return this.success = null }, 3000)
          this.$root.$emit('sendDataToLeftPanelComponent', this.selectedBucket)
        })
        .catch( error => {
          if (error.response.status === 403)
            return this.$router.push({ name: 'login' })

          this.error = error.response.data.message
          setTimeout(() => { return this.error = null }, 3000)
        })
    },

    downloadFile() {
      console.log('down called !')
    },
    editFile() {
      console.log('edit called !')
    },
    deleteFile() {
      this.success = null
      this.error = null
      
      console.log('deletefile called !')
    }

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
  .list-section p {
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
    width: 55%;
  }
  .list-line .download-blob, .list-line .edit-blob, .list-line .delete-blob {
    height: 30px;
    width: 12%;
    color: white;
    border-radius: 5px;
    border-width: 1px;
    border-color: rgba(75,75,75,1);
    outline: 0;
  }
  .list-line .download-blob {
    background: #005073;
  }
  .list-line .edit-blob {
    background: #107dac;
  }
  .list-line .delete-blob {
    background: #1d136a;
  }

.upload-blob-form {
  width: 90%;
  margin-top: 2em;
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

.success, .error {
  font-size: 12px;
  width: 90%;
  text-align: right;
  margin-bottom: 3em;
}

.success {
  color: green;
}

.error {
  color: red;
}

@media screen and (max-width: 640px) {
  #filelist-container {
    overflow: scroll;
    width: 95%;
    padding-left: 1em;
  }
  .create-bucket-form {
    left: 1em;
    bottom: 1em;
  }
    .create-bucket {
      width: 40%;
    }
    .create-bucket {

    }
}

</style>
