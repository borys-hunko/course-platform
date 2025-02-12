import * as dotenv from 'dotenv';
import { Server } from './Server';
import container from './common/inversify.config';

dotenv.config();
Error.stackTraceLimit = Infinity;

const server = container.resolve(Server);

server
  .startServer()
  .then(() => console.log('server started'))
  .catch((err) => console.error('error loading server', err));
