import SockJSClient from 'webpack-dev-server/client/clients/SockJSClient.js';

export default class CustomSockJSClient extends SockJSClient {
  onMessage(f) {
    this.sock.onmessage = (e) => {
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
