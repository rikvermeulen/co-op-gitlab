import { Router } from '@/server/Router';

import { gitlabController } from '@/controllers/gitlabController';

const gitlabRouter = new Router('webhook');

gitlabRouter.add('/webhook', gitlabController);

export { gitlabRouter };
