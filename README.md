# 📚 WEBCHAT

A webchat library based on WebRTC and WebSocket. This repo also contains a demo of it.

## Features

- **Multiple abstract classes that implements WebRTC and WebSocket API**:
  - **Client**: Represents a client that can make and receive calls.
  - **Chat**: Represents a chat that transmits data (texts, audio and video).
  - **Server**: Represents a signaling server based on WebSocket that connects two users.
- **Easy to use**: This front-end lib is based on events that makes much easier the implementation of it.

## How to use

### Running the Demo

To run this project, you will need:

- Node.js >= v10.5.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- npm >= v1.7.0 - [install instructions ("Alternatives" tab)](https://npmpkg.com/en/docs/install#alternatives-rc)

#### Project setup

Do this before all commands bellow.

```
npm install
```

#### Development Server
Runs a local development server to serve the application. It compiles and hot-reloads the application on file change.

```
npm run serve
```

#### Build app

Make the demo ready to production.

```
npm run build
```

### Using the library

*WEBCHAT* is an event based library, that means it produces and works with events. To use it, import the lib on any javascript file.

#### Using events provided by WEBCHAT

Just call the method `on` on an valid WEBCHAT object (Client or Chat).

```javascript
Object.on('event-name', () => {
   // function body 
});
```

##### List of emmited events and objects related:

- **Client**:
  - __*offer-received*__: An offer to chat was received.
  - __*chat-created*__: A chat was created.
  - __*ws-message*__: An unindentified message from WebSocket was received.
- **Chat**:    
  - __*msg-sent*__: A message was sent.
  - __*msg-received*__: A message was received.
  - __*track-received*__: A track was received.

#### Running tests

To test the lib just run

```sh
npm test
npm test --watch
```

### License

Under `MIT` license.
