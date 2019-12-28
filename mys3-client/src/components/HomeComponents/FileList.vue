<template>
  <div id="filelist-container">
    <!--<form method="POST" action="http://localhost:1337/blob/add" enctype="multipart/form-data">
        <div class="upload-form">
            <label>Select your profile picture:</label>
            <input type="file" name="mys3-upload" />
            <input type="submit" class="btn-submit" name="btn-mys3-upload" value="Upload" />
        </div>
    </form>-->
    <div v-if="list && list.length > 0" class="list-section">
      <div class="list-item" v-for="item in list" v-bind:key="item">{{ item }}</div>
    </div>
    <div v-else class="list-section">
      <p>There is nothing to print in this folder.</p>
    </div>
    <div class="create-bucket-form">
      <input type="text" placeholder="Enter bucket name here..." v-model="bucketName" name="bucketName" />
      <button class="create-bucket">
        <img src="../../assets/add-icon.png" alt="add bucket">
        Create a new bucket
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileList',
  data() {
    return { list: null }
  },
  mounted() {
    this.$root.$on('eventing', data => {
      this.list = data
    })
  }
}
</script>

<style scoped>
#filelist-container {
  position: relative;
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 2em;
  padding-top: 2em;
}

.list-section {
  width: 100%;
}
  .list-item {
    width: 90%;
    padding: .5em;
    margin-bottom: .3em;
    border-radius: 3px;
  }
    .list-item:nth-child(odd) {
      background: rgba(40,58,98,.8);
    }
    .list-item:nth-child(even) {
      background: rgba(81,96,130,1);
    }
    .list-item:hover {
      background: rgba(75,75,75,.5);
      cursor: pointer;
    }

.create-bucket-form {
  width: 90%;
  position: absolute;
  bottom: 5em;
  left: 3em;
  display: flex;
  justify-content: space-around;
}
.create-bucket-form input {
  width: 50%;
  padding-left: 1em;
  border-radius: 5px;
}
.create-bucket {
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

.upload-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 5em;
}
  .upload-form input {
    border-radius: 5px;
    padding: .5em 1em;
    outline: 0;
    border: 0;
  }

@media screen and (max-width: 640px) {
  #filelist-container {
    overflow: scroll;
  }
}

</style>
