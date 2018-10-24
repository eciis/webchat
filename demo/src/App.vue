<template>
  <div id="app">
    <Chatbox/>
    <Video/>
    <div>
      </div>
    <Sender/>
  </div>
</template>

<script>
import Chatbox from './components/Chatbox.vue'
import Video from './components/Video.vue'
import Sender from "./components/Sender.vue";

export default {
  name: 'app',
  components: {
    Chatbox,
    Video,
    Sender
  },
}
</script>

<style>
body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#app {
  display: grid;
  grid-template-areas:
    "chat video users"
    "send video server";
  grid-template-columns: 2fr 3fr 1fr;
  grid-template-rows: 3fr 1fr;
}
</style>
