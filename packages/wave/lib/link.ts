import { App, TemplatedApp } from 'uWebSockets.js';
import { identifyAction, wave, Wave } from './internal';

export interface LinkConfig {
  port?: number;
}

export class LinkServer {

  private uws: TemplatedApp;

  public _config: LinkConfig;
  public open: boolean;

  constructor (config?: LinkConfig) {
    if (config) this._config = config;
    this.uws = App();
  }

  private InitWs () {
    this.uws.ws('/*', {
      message: async function (ws, message, isBinary) {
        try {
          const parsed = JSON.parse(Buffer.from(message).toString());
          const { action, data } = parsed;
          const { type, extracted } = identifyAction(action);
          if (type === "call") {
            const action = wave().getAction(extracted);
            if (action) {
              const result = await action.call(data);
              return ws.send(JSON.stringify({
                action: `wave-call-return-${extracted}`,
                data: result
              }), isBinary, true);
            }
          }
        } catch (error) {
          
        }
      }
    });
  }

  private InitRest () {
    console.log(`[Wave] rest is a todo ;)`);
  }

  public Listen (wave: Wave) {
    if (wave._config.rest) this.InitRest();
    this.InitWs();
    const port = this._config.port || 1500;
    this.uws.listen(port, (socket) => {
      if (socket) {
        console.log(`[Wave/Link] Link server is listenning on port ${port}`)
        this.open = true;
      }
    });
  }

}