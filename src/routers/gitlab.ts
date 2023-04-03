import { Router } from '@/server/Router.js';

import { controller } from '@/controllers/gitlabController.js';

const router = new Router('webhook');

router.add('/webhook', controller);

export { router };
