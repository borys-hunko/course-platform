import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../consts';
import { ILocalStorage } from '../localStorage';
import { ILogger, KeyValue } from './types';

// rewrite to elk or grafana
@injectable()
export class Logger implements ILogger {
  constructor(
    @inject(CONTAINER_IDS.LOCAL_STORAGE)
    private localStorage: ILocalStorage,
  ) {}

  info(message: string, data?: KeyValue): void {
    console.info(this.createLogMessage('INFO', message, data));
  }

  warn(message: string, data?: KeyValue): void {
    console.warn(this.createLogMessage('WARN', message, data));
  }

  error(message: string, data?: KeyValue): void {
    console.error(this.createLogMessage('ERROR', message, data));
  }

  debug(message: string, data?: KeyValue): void {
    console.debug(this.createLogMessage('DEBUG', message, data));
  }

  private createLogMessage = (
    logLevel: 'INFO' | 'ERROR' | 'DEBUG' | 'WARN',
    message: string,
    data?: KeyValue,
  ) => {
    const logMsg: KeyValue = { logLevel, message };
    const correlationId = this.localStorage.get('correlationId');
    logMsg.data = data;
    if (!logMsg.data) {
      logMsg.data = {};
    }
    logMsg.data.correlationId = correlationId;
    return logMsg;
  };
}
