import WebSocketClient from 'webpack-dev-server/client/clients/WebSocketClient.js';

export default class CustomWebSocketClient extends WebSocketClient {
  onMessage(f) {
    this.client.onmessage = (e) => {
      const message = JSON.parse(e.data);

      if (message.type === 'reload') {
        console.info('[webpack-dev-server] Generator updated. Reloading...');

        window.location.reload();

        return;
      }

      f(e.data);
    };
  }
}
