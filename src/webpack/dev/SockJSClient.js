/* eslint-disable no-console */
import SockJSClient from 'webpack-dev-server/client/clients/SockJSClient';

export default class CustomSockJSClient extends SockJSClient {
  onMessage(f) {
    this.client.onmessage = (e) => {
      const message = JSON.parse(e.data);

      if (message.type === 'reload') {
        console.log('[webpack-dev-server] Generator updated. Reloading...');

        window.location.reload();

        return;
      }

      f(e.data);
    };
  }
}
