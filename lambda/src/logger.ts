export type Logger = ReturnType<typeof createLogger>;

export const createLogger = () => ({
  info: (message: string, correlationId?: string, ...data: any[]) =>
    console.info(message, { correlationId }, data),
  debug: (message: string, correlationId?: string, ...data: any[]) =>
    console.debug(message, { correlationId }, data),
  error: (message: string, correlationId?: string, ...data: any[]) =>
    console.error(message, { correlationId }, data),
  warn: (message: string, correlationId?: string, ...data: any[]) =>
    console.warn(message, { correlationId }, data),
});
