const WebSocket = require('ws');

class Server {
  constructor(port) {
    this.wss = new WebSocket.Server({ port });
    this.users = {};
    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        const msg = JSON.parse(message);
        if (!msg.type) {
          console.log('Invalid message');
          console.log(msg)
          return;
        }
        switch (msg.type) {
          case 'signin':
            this.handleSignin(msg, ws);
            break;
          case 'rpc-offer':
            this.handleOffer(msg);
            break;
          case 'rpc-answer':
            this.handleAnswer(msg);
            break;
          case 'ice-candidate':
            this.handleIceCandidate(msg);
            break;
          case 'user-list-request':
            this.handleUsersRequest(msg);
            break;
          case 'call-request':
            this.handleCallRequest(msg);
            break;
          case 'call-answer':
            this.handleCallAnswer(msg);
            break;
          default:
            console.log(`Message of type: ${msg.type} not handled.`);
            break;
        }
      });
      ws.on('close', (connection) => {
        const user = Object.keys(this.users).find(k => this.users[k] === ws);
        delete this.users[user];
        console.log(`${user} has disconnected.`);
        this.broadcastUsers();
      });
    });
  }

  handleUsersRequest(msg) {
    const to = msg.from;
    console.log(`${to} has requested online users`)
    this.sendUserList(to);
  }

  broadcastUsers() {
    console.log(`Broadcasting userList to ${this.wss.clients.size} users.`)
    this.wss.clients.forEach((client) => {
      const to = Object.keys(this.users).find(u => this.users[u] === client);
      this.sendUserList(to);
    });
  }

  sendUserList(to) {
    const users = Object.keys(this.users);
    console.log(`Sending user list to ${to}`)
    this.sendMessageToUser('user-list-update', 'server', to, users);
  }

  handleIceCandidate(msg) {
    console.log(`${msg.from} has sent candidate to ${msg.to}`);
    this.sendMessageToUser('ice-candidate-received', msg.from, msg.to, msg.data);
  }

  handleSignin(msg, ws) {
    console.log(`${msg.from} has connected`);
    this.users[msg.from] = ws;
    this.broadcastUsers();
  }

  handleOffer(msg) {
    console.log(`${msg.from} has rpc-offered ${msg.to}`);
    this.sendMessageToUser(msg.type, msg.from, msg.to, msg.data);
  }

  handleAnswer(msg) {
    console.log(`${msg.to} has rpc-answered`);
    this.sendMessageToUser(msg.type, msg.from, msg.to, msg.data);
  }

  handleCallRequest(msg) {
    console.log(`${msg.from} has called ${msg.to}`);
    this.sendMessageToUser(msg.type, msg.from, msg.to, msg.data);
  }

  handleCallAnswer(msg) {
    console.log(`${msg.from} has been answered by ${msg.to}`);
    this.sendMessageToUser(msg.type, msg.from, msg.to, msg.data);
  }

  sendMessageToUser(type, from, to, data) {
    const msg = JSON.stringify({type, id: from, data});
    if (to in this.users) {
      this.users[to].send(msg);
    }
  }
}

const port = 8090;
new Server(8090);
console.log(`Server listening on ${port}`)

module.exports.Server = Server;
