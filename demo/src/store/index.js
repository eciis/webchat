import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    remoteStream: {},
    selfie: {},
  },
  mutations: {
    changeUser (state, user) {
      state.user = user;
    },

    changeRemoteStream (state, remote) {
      state.remoteStream = remote;
    },

    changeSelfie (state, selfie) {
      state.selfie = selfie;
    },
  }
})
