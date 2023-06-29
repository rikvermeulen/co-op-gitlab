import { Router } from '@/server/Router';

import { loginController } from '@/controllers/loginController';
import { userController } from '@/controllers/userController';

const userRouter = new Router('users');

userRouter.add('/login', loginController);

userRouter.add('/users', userController);

export { userRouter };
