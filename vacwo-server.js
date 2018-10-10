const WebSocket = require('ws');

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

module.exports.Server = Server;
