import { config } from '@/server/Config.js';
import { Runtime } from '@/server/Runtime.js';
import { Server } from '@/server/Server.js';

import { router } from './routers/gitlab.js';

const { PORT, HOST } = config;

const server = new Server();

const routers = [router];

Runtime(() => {
  server.includeDefaultBodyParsers();
  server.includeDefaultCorsHeaders(`http://${HOST}:${PORT}`);
  server.loadRouters(routers);
  server.run();
});
