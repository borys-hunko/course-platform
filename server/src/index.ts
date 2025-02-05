import * as dotenv from 'dotenv';
import { Server } from './Server';
import container from './common/inversify.config';

dotenv.config();

const server = container.resolve(Server);

server.startServer();
