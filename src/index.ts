import { Runtime } from '@/server/Runtime.js';
import { Server } from '@/server/Server.js';

import { router } from './routers/gitlab.js';

const server = new Server();

const routers = [router];

Runtime(() => {
  server.includeDefaultBodyParsers();
  server.includeDefaultCorsHeaders('http://localhost:3000');
  server.loadRouters(routers);
  server.run();
});
