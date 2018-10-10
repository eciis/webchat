const express = require('express');
const path = require('path');
const ip = require('ip');
const vacwo = require('./vacwo-server');

const app = express();
const PORT = 8080;
const WS_PORT = 8090;

const server = new vacwo.Server(WS_PORT);

app.use('/', express.static('src'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/chat.html'));
});

app.listen(PORT, () => {
  console.log(`Listening on http://${ip.address()}:${PORT}`);
});
