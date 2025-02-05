import { injectable } from 'inversify';
import { ILocalStorageLogger, KeyValue } from '.';

@injectable()
export class LocalStorageLogger implements ILocalStorageLogger {
  constructor() {}

  info(message: string, correlationId: string, data?: KeyValue): void {
    console.info(this.createLogMessage(message, correlationId, data));
  }

  warn(message: string, correlationId: string, data?: KeyValue): void {
    console.warn(this.createLogMessage(message, correlationId, data));
  }

  error(message: string, correlationId: string, data?: KeyValue): void {
    console.error(this.createLogMessage(message, correlationId, data));
  }

  debug(message: string, correlationId: string, data?: KeyValue): void {
    console.debug(this.createLogMessage(message, correlationId, data));
  }

  private createLogMessage = (
    message: string,
    correlationId: string,
    data?: KeyValue,
  ) => {
    const logMsg: KeyValue = { message };
    logMsg.data = data;
    if (!logMsg.data) {
      logMsg.data = {};
    }
    logMsg.data.correlationId = correlationId;
    return logMsg;
  };
}
