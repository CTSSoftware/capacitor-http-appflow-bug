import {Injectable} from '@angular/core';

export enum LogLevel {
    None = -1,        // Disable all logging
    Fatal = 0,        // If you have a pager, it goes off when one of these occurs.
    Warning = 1,      // Service is degraded or endangered.
    Debug = 2,        // Internal system events that aren't necessarily observable from the outside.
    Information = 3,  // The lifeblood of operational intelligence - things happen.
    Verbose = 4       // Anything and everything you might want to know about a running block of code.
}

@Injectable({
    providedIn: 'root'
})
export class LoggingService {

  private _handler: (logLevel: LogLevel, data: any[]) => void = (x => {});

  constructor() {
    this.init();
  }

  private backupConsole: { log: ((... data: any[]) => void) | null; warn: ((... data: any[]) => void) | null; error: ((... data: any[]) => void) | null; trace: ((... data: any[]) => void) | null; info: ((... data: any[]) => void) | null; } = {
      log: null,
      warn: null,
      error: null,
      trace: null,
      info: null
  };

  public async setLogHandler(handler: ((logLevel: LogLevel, logMessage: any[]) => void) | null) {
    this._handler = handler || (x => {});
  }

  public init() {
    try {
      if (!this.backupConsole.log) {
        this.backupConsole.log = console.log;
        this.backupConsole.warn = console.warn;
        this.backupConsole.error = console.error;
        this.backupConsole.error = console.trace; // tslint:disable-line:no-console
        this.backupConsole.error = console.info; // tslint:disable-line:no-console
        console.log = ((...data: any[]) => this._log(...data));
        console.warn = ((...data: any[]) => this._warn(...data));
        console.error = ((...data: any[]) => this._error(...data));
        console.trace = ((...data: any[]) => this._trace(...data)); // tslint:disable-line:no-console
        console.info = ((...data: any[]) => this._info(...data)); // tslint:disable-line:no-console
      }/* else {
        console.log = this.backupConsole.log;
        console.warn = this.backupConsole.warn;
        console.error = this.backupConsole.error;
        console.trace = this.backupConsole.trace; // tslint:disable-line:no-console
        console.info = this.backupConsole.info; // tslint:disable-line:no-console
        this.backupConsole.log = this.backupConsole.warn = this.backupConsole.error =
            this.backupConsole.error = this.backupConsole.error = null;
      }*/
    } catch (err) {}
  }

  private handleLog(logLevel: LogLevel, data: any) {
    this.init();
    let args: any[] = [];
    if (Array.isArray(data)) args.push.apply(args, data);
    else if (data) args.push(data);

    if (!!this._handler) {
      try {
        this._handler(logLevel, args);
      } catch (err)  {}
    }
    this.logToConsoleInternal(logLevel, args);
  }

  private logToConsoleInternal(logLevel: LogLevel, args: any[]) {

      // if this is a console.xxx command, then we need to route it to the correct console command
      switch (logLevel) {
          case LogLevel.Debug:
            if (this.backupConsole?.trace) this.backupConsole.trace(...args); // tslint:disable-line:no-console
            break;
          case LogLevel.Information:
            if (this.backupConsole?.info) this.backupConsole.info(...args); // tslint:disable-line:no-console
            break;
          case LogLevel.Fatal:
            if (this.backupConsole?.error) this.backupConsole.error(...args); // tslint:disable-line:no-console
            break;
          case LogLevel.Warning:
            if (this.backupConsole?.warn) this.backupConsole.warn(...args); // tslint:disable-line:no-console
            break;
          default:
            if (this.backupConsole?.log) this.backupConsole.log(...args); // tslint:disable-line:no-console
            break;
      }
  }

  log(...data: any[]) {
    this.handleLog(LogLevel.Verbose, data);
  }

  logInformation(...data: any[]) {
      this.handleLog(LogLevel.Information, data);
  }

  logTrace(...data: any[]) {
      this.handleLog(LogLevel.Debug, data);
  }

  logWarning(...data: any[]) {
      this.handleLog(LogLevel.Warning, data);
  }

  logFatal(...data: any[]) {
      this.handleLog(LogLevel.Fatal, data);
  }

  _log(...data: any[]) {
    this.handleLog(LogLevel.Verbose, data);
  }

  _error(...data: any[]) {
    this.handleLog(LogLevel.Fatal, data);
  }

  _warn(...data: any[]) {
    this.handleLog(LogLevel.Warning, data);
  }

  _trace(...data: any[]) {
    debugger;
    this.handleLog(LogLevel.Debug, data);
  }

  _info(...data: any[]) {
    this.handleLog(LogLevel.Information, data);
  }
}


