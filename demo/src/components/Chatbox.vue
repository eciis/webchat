<template lang="pug">
div.chatbox
  h2 Chatbox
  p(v-for='msg in msgs') {{msg}}
</template>

<script>
export default {
  data() {
    return {
      msgs: [],
    }
  },

  computed: {
    user() {
      return this.$store.state.user;
    }
  },

  watch: {
    user (newV, oldV) {
      this.user.on('chat-created', (e) => {
        this.chat = e.chat;
        this.chat.on('msg-received', e => this.msgs.push(e.data));
        this.chat.on('msg-sent', msg => this.msgs.push(msg));
      });
    }
  },
}
</script>

<style lang="scss" scoped>
.chatbox {
  grid-area: "chat";
  border: solid 1px black;
  border-radius: 12px;
}
</style>

