import * as dotenv from 'dotenv';
import container from './common/inversify.config';
import { CONTAINER_IDS } from './common/consts';
import { Server } from './Server';

dotenv.config();
Error.stackTraceLimit = Infinity;

const start = async () => {
  const server = await container.getAsync<Server>(CONTAINER_IDS.SERVER);
  await server.startServer();
};

start()
  .then(() => console.log('server started'))
  .catch((err) => console.error('error loading server', err));
