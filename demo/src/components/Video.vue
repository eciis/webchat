<template lang="pug">
div.container
  div.video-container
    span STREAM
    video(autoplay inline
          ref="video"
          width="160"
          height="120"
          src="stream")
  div.video-container
    span SELFIE
    video(autoplay inline
          ref="selfie"
          width="80"
          height="60"
          src="stream")
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.state.user;
    },

    stream() {
      return this.$store.state.remoteStream;
    },

    selfie() {
      return this.$store.state.selfie;
    },
  },

  watch: {
    stream(newV, oldV) {
      console.log('stream changed');
      this.$refs.video.srcObject = newV;
    },
    selfie(newV, oldV) {
      console.log('selfie changed');
      this.$refs.selfie.srcObject = newV;
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  display: grid;
  border: solid 1px black;
  border-radius: 12px;
  grid-area: "video";
  grid-template-rows: 2fr 1fr;
}
.video-container {
  display: grid;
  grid-template-rows: 1fr 3fr;
  align-items: center;
  justify-content: center;
}

video {
  border: solid 1px black;
  border-radius: 4px;
  background: gray;
}
</style>

