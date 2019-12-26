<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div id="#login">
      <h1>myS3</h1><hr>
      <h2>{{ webpack }}</h2>
        <div class="login-form">
            <label>Nickname</label>
            <input type="text" name="nickname" />
            <label>Password</label>
            <input type="password" name="password" />
            <input type="submit" class="btn-submit" name="btn-mys3-login" value="Login" />
        </div>

        <form method="POST" action="http://localhost:1337/blob/add" enctype="multipart/form-data">
            <div class="upload-form">
                <label>Select your profile picture:</label>
                <input type="file" name="mys3-upload" />
                <input type="submit" class="btn-submit" name="btn-mys3-upload" value="Upload" />
            </div>
        </form>
    </div>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener">babel</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener">eslint</a></li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#main-container {
  background: black;
  margin: 0;
  width: 99.5%;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: '', sans-serif;
}

hr {
  width: 100%;
}

label {
  margin-top: 1em;
  margin-bottom: .5em;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 5em;
}
  .login-form input {
    border-radius: 5px;
    padding: .5em 1em;
    outline: 0;
    border: 0;
  }

.btn-submit {
  margin-top: 1em;
  background: rgba(40,58,98,.8);
  color: white;
  height: 40px;
}
  .btn-submit:hover {
    background: rgba(50,68,108,1);
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

</style>
