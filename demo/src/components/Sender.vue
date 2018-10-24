<template lang="pug">
div.container
  div(:class='{ hidden: userStarted }')
    input(type="text" v-model='userId')
    button(@click='createUser') start
  div(:class='{ hidden: !userStarted }')
    input(type="text" v-model='dest')
    button(@click='call') dest
  div(:class='{ hidden: !userStarted }')
    input(type="text" v-model='message')
    button(@click='sendMessage') send
</template>

<script>
import * as vacwo from "vacwo-client-js";

export default {
  data() {
    return {
      userId: '',
      message: '',
      userStarted: false,
      chat: {},
      dest: '',
    }
  },

  computed: {
    user() {
      return this.$store.state.user;
    }
  },

  methods: {
    createUser() {
      this.$store.commit('changeUser', new vacwo.Client(this.userId))

      this.user.on('offer-received', async (name) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true});
          this.$store.commit('changeSelfie', stream);
          this.user.acceptChat(name, stream);
        } catch (e) {
          alert(e);
        }
      });

      this.user.on('chat-created', e => {
        this.chat = e.chat;
        this.chat.on('track-received', e => {
          this.$store.commit('changeRemoteStream', e.streams[0]);
        });
      })

      this.userStarted = true;
    },

    async call() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true});
        this.$store.commit('changeSelfie', stream);
        this.user.call(this.dest, stream);
      } catch (e) {
        alert(e)
      }
    },

    sendMessage() {
      this.chat.sendMessage(this.message);
      this.message = '';
    }
  },

  mounted() {
    vacwo.setServer(location.hostname, '8090');
  }
}
</script>

<style lang="scss" scoped>
.container {
  grid-area: "send";
  border: solid 1px black;
  border-radius: 12px;
}

.hidden {
  visibility: hidden;
}
</style>

