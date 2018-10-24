const vacwo = require('../src/main');

describe('Test', () => {
  vacwo.setServer('localhost', '8090');
  let mainServer = new vacwo.Server(8090);
  let client1 = new vMain.Client('pedro');
  let client2 = new vMain.Client('bruno');

  it('should create a new chat', () => {
    client1.call(client2);
    client2.acceptChat(client1);
    console.log(client2.chats);
  });
});
