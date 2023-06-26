import { Router } from '@/server/Router';

import { userController } from '@/controllers/userController';

const userRouter = new Router('users');

userRouter.add('/users', userController);

export { userRouter };
