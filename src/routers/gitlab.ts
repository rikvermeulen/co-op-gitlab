import { Router } from '@/server/Router';

import { controller } from '@/controllers/gitlabController';

const router = new Router('webhook');

router.add('/webhook', controller);

export { router };
