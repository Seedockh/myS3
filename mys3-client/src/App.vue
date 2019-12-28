<template>
  <div id="app" :key="token">
    <div class="header">
      <h1>myS3</h1>
      <hr>
    </div>
    <div class="content">
      <router-view class="view"></router-view>
    </div>
    <div class="footer">
      <hr>
      <div class="credits">
        <p>Powered by Vue.js and Express</p>
        <p>Authors : Pierre Hérissé - Antoine Nivoy</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  components: {},
  data() { return { token: localStorage.token } },
}
</script>

<style>
body {
  margin: 0;
  width: 100vw;
  height: 100vh;
  font-size: 15px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: black;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  color: rgba(81,96,130,1);
}

hr {
  width: 90%;
  border-collapse: collapse;
  border: 1px solid #193d63;
}

.content {
  border: 1px solid #193d63;
  border-radius: 5px;
  width: 100%;
  height: 70%;
  min-width: 300px;
  max-width: 90vw;
}

.footer {
  width: 100%;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(81,96,130,1);
}
  .footer .credits {
    width: 90%;
    display: flex;
    justify-content: space-between;
  }

</style>
