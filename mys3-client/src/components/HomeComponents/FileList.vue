<template>
  <div id="filelist-container">
    <!--<form method="POST" action="http://localhost:1337/blob/add" enctype="multipart/form-data">
        <div class="upload-form">
            <label>Select your profile picture:</label>
            <input type="file" name="mys3-upload" />
            <input type="submit" class="btn-submit" name="btn-mys3-upload" value="Upload" />
        </div>
    </form>-->
    <div class="list-section">

    </div>
    <div class="logout-section">

    </div>
    <p>This is the file list</p>
    <p>This is the file list</p>
    <p>This is the file list</p>
    <p>This is the file list</p>
    <p>This is the file list</p>
    <p>This is the file list</p>
    <p>This is the file list</p>
  </div>
</template>

<script>
export default {
  name: 'FileList',
}
</script>

<style scoped>
#filelist-container {
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 2em;
  padding-top: 2em;
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
