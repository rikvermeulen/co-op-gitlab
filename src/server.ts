import user from '@/models/user';
import { gitlabRouter } from '@/routers/gitlab.js';
import { config } from '@/server/Config.js';
import Database from '@/server/Database.js';
import { Runtime } from '@/server/Runtime.js';
import { Server } from '@/server/Server.js';

import { userRouter } from './routers/user';

const { PORT, HOST } = config.app;

const server = new Server();

const models = [user];

const routers = [gitlabRouter, userRouter];

Runtime(async () => {
  await Database.init(models);

  server.includeDefaultBodyParsers();
  server.includeDefaultCorsHeaders(`http://${HOST}:${PORT}`);
  server.loadRouters(routers);
  server.loadForestAdmin();
  server.run();
});
