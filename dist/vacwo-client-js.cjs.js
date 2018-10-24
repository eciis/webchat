'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const WebSocket = require('ws');
let hostname = '';
let port = '';

class Chat {
  emit(eventName, e) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach((f) => {
        f(e);
      });
    }
  }

  on(eventName, f) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(f);
  }

  receiveCandidate(candidate) {
    if (this.rpc.remoteDescription == null) {
      this.pendingCandidates.push(candidate);
      return;
    }
    const rtcCandidate = new RTCIceCandidate(candidate);

    this.rpc.addIceCandidate(rtcCandidate);
  }

  handleDataChannel(e) {
    const chat = this;
    e.channel.onmessage = channelEv => chat.emit('msg-received', channelEv);
  }

  constructor() {
    this.rpc = new RTCPeerConnection([
      { url: 'stun:stun.l.google.com:19302' },
    ]);
    this.eventHandlers = {};
    this.pendingCandidates = [];
    this.tempRemote = {};
  }

  async init(stream) {
    stream.getTracks().forEach(t => this.rpc.addTrack(t, stream));
    // this.rpc.addTrack(stream.getTracks()[1], stream);
    this.sendChannel = this.rpc.createDataChannel('sendChannel');
    this.rpc.ondatachannel = this.handleDataChannel.bind(this);
    this.rpc.ontrack = this.handleTrack.bind(this);
    this.rpc.onicecandidate = e => this.emit('ice-candidate', e);
  }

  async offer() {
    const offer = await this.rpc.createOffer();
    await this.rpc.setLocalDescription(offer);
    return offer;
  }

  async setTempRemote(remote) {
    this.tempRemote = remote;
  }

  async setRemote(remote) {
    this.rpc.setRemoteDescription(remote);
  }

  async accept() {
    const answer = await this.rpc.createAnswer();
    await this.rpc.setLocalDescription(answer);
    if (this.pendingCandidates.length > 0) {
      this.pendingCandidates.forEach(c => this.receiveCandidate(c));
    }
    return answer;
  }

  handleTrack(e) {
    this.emit('track-received', e);
  }

  sendMessage(message) {
    this.sendChannel.send(message);
    this.emit('msg-sent', message);
  }
}

class Client {
  constructor(id) {
    this.id = id;
    this.ws = new WebSocket(`ws://${hostname}:${port}`);
    // maps event name to function
    this.eventHandlers = {};
    // maps id to remote descriptions
    this.remotes = {};
    // maps id to Chat
    this.chats = {};

    this.ws.onopen = () => {
      const user = {
        type: 'signin',
        name: this.id,
      };
      this.ws.send(JSON.stringify(user));
    };
    // we have to explictly pass a function with the event argument
    // otherwise "this" will refer to the websocket instead of the Client object
    // i.e.: this.ws.onmessage = handleWebSocket
    //                            /\_____ this inside here will be the websocket
    // we could also bind (this) back
    // this.ws.onmessage = this.handleWebSocket(this); <-- also works
    this.ws.onmessage = e => this.handleWebSocket(e);
  }

  createChat(id) {
    const chat = new Chat();
    this.chats[id] = chat;
    this.emit('chat-created', { id, chat });
    return chat;
  }

  handleWebSocket(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'offer') {
      const chat = this.createChat(data.name);
      chat.setTempRemote(data);
      this.emit('offer-received', data.name);
    } else if (data.type === 'answer') {
      this.handleAnswer(data);
    } else if (data.candidate) {
      this.addIceCandidate(data);
    } else {
      this.emit('ws-message', e);
    }
  }

  emit(eventName, e) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach((f) => {
        f(e);
      });
    }
  }

  on(eventName, f) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(f);
  }

  addIceCandidate(e) {
    if (this.chats[e.name]) {
      this.chats[e.name].receiveCandidate(e.candidate);
    }
  }

  async acceptChat(id, stream) {
    const chat = this.chats[id];
    chat.setRemote(chat.tempRemote);
    await chat.init(stream);
    const connection = await chat.accept();
    await this.ws.send(JSON.stringify({
      type: connection.type,
      sdp: connection.sdp,
      name: this.id,
      dest: id,
    }));
    chat.on('ice-candidate', e => this.handleDiscoveredIceCandidates(id, e));
  }

  handleDiscoveredIceCandidates(id, e) {
    if (e.candidate) {
      const msg = {
        type: 'newCandidate',
        name: this.id,
        dest: id,
        candidate: e.candidate,
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  handleAnswer(data) {
    const chat = this.chats[data.name];
    chat.setRemote(data);
  }

  async call(dest, stream) {
    const chat = this.createChat(dest);
    await chat.init(stream);
    const connection = await chat.offer();
    const requestObj = {
      name: this.id,
      dest,
      type: connection.type,
      sdp: connection.sdp,
    };
    this.ws.send(JSON.stringify(requestObj));
    chat.on('ice-candidate', e => this.handleDiscoveredIceCandidates(dest, e));
  }
}

class Server {
  constructor(port) {
    this.wss = new WebSocket.Server({ port });
    this.users = {};
    this.wss.on('connection', (ws) => {
      ws.on('message', (msgJSON) => {
        const msg = JSON.parse(msgJSON);
        if (!msg.type) {
          console.log(`Invalid message: ${msg}`);
          return;
        }
        switch (msg.type) {
          case 'signin':
            this.handleUserConnection(msg, ws);
            break;
          case 'offer':
            this.handleRequestConnection(msg);
            break;
          case 'answer':
            this.handleAnswer(msg);
            break;
          case 'newCandidate':
            this.handleNewIceCandidate(msg);
            break;
          default:
            console.log(`Message of type ${msg.type} not handled.`);
            break;
        }
      });
    });
  }

  sendMsgToUser(msg) {
    if (msg.dest in this.users) {
      this.users[msg.dest].send(JSON.stringify(msg));
    }
  }

  handleUserConnection(msg, ws) {
    console.log(`${msg.name} has connected`);
    this.users[msg.name] = ws;
  }

  handleRequestConnection(msg) {
    console.log(`${msg.name} has called ${msg.dest}`);
    this.sendMsgToUser(msg);
  }

  handleAnswer(msg) {
    console.log(`${msg.dest} has been answered`);
    this.sendMsgToUser(msg);
  }

  handleNewIceCandidate(msg) {
    console.log(`${msg.name} has sent candidate to ${msg.dest}`);
    this.sendMsgToUser(msg);
  }
}

function setServer(h, p) {
  hostname = h;
  port = p;
}

exports.Client = Client;
exports.Server = Server;
exports.setServer = setServer;
