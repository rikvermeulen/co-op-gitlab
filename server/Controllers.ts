import { Request, Response, Router } from 'express';
import { logger } from '@/server/Logger.js';

import type { RouterMethods, Middleware, Handler } from '@/server/types.js';

export interface Route {
  path: string;
  method: string;
  handler: (req: Request, res: Response) => void;
  middlewares: Array<Middleware>;
}

class Controller {
  name: string;
  router = Router();
  routes: Array<Route>;

  constructor(name: string) {
    if (!name || typeof name !== 'string') {
      throw new Error(`A Controller must be named. Got: ${name}`);
    }

    this.name = name;
    this.routes = [];
  }

  private addMiddleware(path: string, middleware: Middleware) {
    this.router.use(path, middleware);
  }

  private addRoute(method: keyof RouterMethods, path: string, handler: Handler) {
    if (typeof this.router[method] === 'function') {
      this.router[method](path, handler);
    }
  }

  private add(
    method: keyof RouterMethods,
    path: string,
    handler: Handler,
    middlewares: Array<Middleware>,
  ) {
    middlewares.forEach((middleware) => {
      this.addMiddleware(path, middleware);
    });

    this.addRoute(method, path, handler);

    this.routes.push({
      path,
      method,
      handler,
      middlewares,
    });
  }

  getRouter(routerName: string): Router {
    if (this.routes.length === 0) {
      logger.warn(`[CONTROLLER] ${routerName}/${this.name} is initialized without routes!`);
    }

    return this.router;
  }

  get(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('get', path, handler, middlewares);
  }

  post(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('post', path, handler, middlewares);
  }

  put(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('put', path, handler, middlewares);
  }

  patch(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('patch', path, handler, middlewares);
  }

  delete(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('delete', path, handler, middlewares);
  }
  copy(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('copy', path, handler, middlewares);
  }

  head(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('head', path, handler, middlewares);
  }

  options(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('options', path, handler, middlewares);
  }
  purge(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('purge', path, handler, middlewares);
  }

  lock(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('lock', path, handler, middlewares);
  }

  unlock(path: string, middlewares: Array<Middleware> = [], handler: Handler) {
    this.add('unlock', path, handler, middlewares);
  }
}

export { Controller };
