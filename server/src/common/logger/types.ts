export interface ILogger {
  info(message: string, data?: KeyValue): void;
  warn(message: string, data?: KeyValue): void;
  error(message: string, data?: KeyValue): void;
  debug(message: string, data?: KeyValue): void;
}

// interface made to avoid circular dependency in localstorage class
export interface ILocalStorageLogger {
  info(message: string, correlationId: string, data?: KeyValue): void;
  warn(message: string, correlationId: string, data?: KeyValue): void;
  error(message: string, correlationId: string, data?: KeyValue): void;
  debug(message: string, correlationId: string, data?: KeyValue): void;
}

export interface KeyValue {
  [key: string]: any;
}
