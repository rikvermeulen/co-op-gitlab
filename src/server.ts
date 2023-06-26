import { gitlabRouter } from '@/routers/gitlab.js';
import { config } from '@/server/Config.js';
import { Runtime } from '@/server/Runtime.js';
import { Server } from '@/server/Server.js';

import { userRouter } from './routers/user';

const { PORT, HOST } = config.app;

const server = new Server();

const routers = [gitlabRouter, userRouter];

Runtime(() => {
  server.includeDefaultBodyParsers();
  server.includeDefaultCorsHeaders(`http://${HOST}:${PORT}`);
  server.loadRouters(routers);
  server.run();
});
