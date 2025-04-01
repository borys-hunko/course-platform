export interface IQueueConsumer {
  start(): Promise<void>;
}
