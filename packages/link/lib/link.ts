export interface LinkConfig {
  uri: string;
  reconnectInterval: number;
  maxRetries: number;
  actionTimeout: number;
}

export interface ActionReturn {
  status: number | string;
  data?: any;
}

export class Link {
  public _ws: WebSocket;
  public _listeners: {
    [key: string]: Function[];
  } = {};
  public ready: boolean;
  public config: LinkConfig;
  private interval;

  constructor (config?: Partial<LinkConfig>) {
    this.config = {
      uri: 'ws://localhost:1500',
      reconnectInterval: 1500,
      maxRetries: 5,
      actionTimeout: 16000,
      ...this.config,
      ...config
    }
    this.connect();
    this.setInt();
  }

  private connect () {
    this._ws = new WebSocket(this.config.uri);
    this._ws.onopen = () => {
      console.log(`[Wave] ws open, ready for events !`);
      this.ready = true;
    }
    this._ws.onclose = () => {
      this.ready = false;
    }
    this._ws.onerror = () => {
      this.ready = false;
    }
    this.Listen();
    this.globalBind();
  }

  public Configure (config: Partial<LinkConfig>) {
    this.config = {
      ...this.config,
      ...config
    };
    this.setInt();
  }

  public async Call (action: string, payload: any): Promise<ActionReturn> {
    return await new Promise(async (resolve) => {
      if (!await this.waitForReady()) return resolve({ status: 'timeout', data: '' });
      this._ws.send(JSON.stringify({
        action: `wave-call-incoming-${action}`,
        data: payload
      }))
      let to = setTimeout(() => (resolve({ status: 'timeout', data: '' })), this.config.actionTimeout);
      const onReturn = (data) => {
        clearTimeout(to);
        this.off(`wave-call-incoming-${action}`, onReturn);
        if (!data) data = { status: 'unknown', data: 'nothing_returned' };
        return resolve(data);
      };
      this.on(`wave-call-return-${action}`, onReturn);
    });
  }

  public Listen () {
    this._ws.onmessage = (msg) => {
      try {
        const { action, data } = JSON.parse(msg.data);
        const handlers = this._listeners[action];
        if (handlers && handlers.length > 0) {
          for (const func of handlers) {
            func(data);
          }
        }
      } catch (error) {
        
      }
    }
  }

  public on (event: string, callback: Function) {
    if (!this._listeners[event]) this._listeners[event] = [];
    if (!this._listeners[event].includes(callback)) this._listeners[event].push(callback);
    this.Listen();
  }

  public off (event: string, callback?: Function) {
    if (this._listeners[event]) {
      if (callback) {
        if (this._listeners[event].includes(callback)) this._listeners[event].splice(this._listeners[event].indexOf(callback), 1);
      } else this._listeners[event] = undefined;
    }
  }

  private async waitForReady () {
    return await new Promise((resolve) => {
      let int = undefined;
      let tries = 0;
      const checkInit = () => {
        tries++;
        if (tries > this.config.maxRetries) {
          clearInterval(int);
          return resolve(false);
        }
        if (this.ready) {
          return resolve(true);
        }
      }
      int = setInterval(checkInit, this.config.reconnectInterval);
    });
  }

  private setInt () {
    setTimeout(() => {
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(() => {
        if (!this.ready) this.connect();
      }, this.config.reconnectInterval);
    }, 5000);
  }

  private globalBind () {
    try {
      globalThis.__wave_link__ = Link;
      globalThis.__wave_link__app = this;
    } catch (error) {
      // fail silently
    }
  }
}