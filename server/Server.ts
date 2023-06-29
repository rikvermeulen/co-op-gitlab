import { Server as HttpServer } from 'http';
import os from 'os';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { config } from '@/server/Config.js';
import { Controller } from '@/server/Controllers.js';
//Runtime imports for the server
import { Logger } from '@/server/Logger.js';
import { Router } from '@/server/Router.js';

import 'dotenv/config';

class Server {
  #app = express();

  #host;

  #port;

  constructor() {
    // Log server start
    Logger.info('[SERVER] App starting...');

    // Set the host and port
    this.#host = config.app.HOST ?? 'localhost';
    this.#port = config.app.PORT ? parseInt(config.app.PORT, 10) : 3000;

    // Set the Express app to allow proxy's
    this.#app.enable('trust proxy');

    // Disable powered by header for security reasons
    this.#app.disable('x-powered-by');

    // Expose a health check
    this.#app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl === '/health') {
        res.json({
          status: 'UP',
          host: os.hostname(),
          load: process.cpuUsage(),
          mem: process.memoryUsage(),
          uptime: process.uptime(),
        });
        return;
      }
      next();
    });
  }

  run(): HttpServer {
    return this.#app.listen(this.#port, this.#host, () => {
      Logger.info(
        `[SERVER] Service started with success! App running at: ${this.#host}:${this.#port}`,
      );
    });
  }

  loadMiddlewares(middlewares: Array<any>) {
    middlewares.forEach((mw) => {
      this.#app.use(mw);
    });

    Logger.info(`[SERVER] Loaded ${middlewares.length} global middleware(s)`);
  }

  loadRouters(routers: Array<Router>): void {
    routers.forEach((router) => {
      if (router instanceof Router) {
        const routes = router.routes;

        if (routes.length === 0) {
          Logger.warn(`[ROUTER] ${router.name} is initialized without routes!`);
        }

        routes.forEach((route: any) => {
          if (route.controller instanceof Controller) {
            route.middlewares.forEach((middleware: any) => {
              this.#app.use(route.path, middleware);
            });

            this.#app.use(route.path, route.controller.getRouter(router.name));
          } else {
            Logger.error('Error at line:', route);
            throw new Error(`Class is not an instance of 'Controller'!`);
          }
        });

        Logger.info(`[SERVER] Loaded ${routes.length} router(s)`);
      } else {
        Logger.error('Error at line:', router);
        throw new Error(`Class is not an instance of 'Router'!`);
      }
    });
  }

  includeDefaultBodyParsers() {
    this.#app.use(express.json());
    this.#app.use(express.text());
    this.#app.use(express.urlencoded({ extended: false }));

    Logger.info(`[SERVER] Loaded default body parsers (json, text, urlencoded and multer)`);
  }

  includeDefaultCorsHeaders(origin: string | RegExp) {
    this.#app.use(
      cors({
        origin,
      }),
    );

    Logger.info(`[SERVER] Loaded default CORS headers`);
  }

  includeDefaultCompression() {
    const compression = require('compression');

    this.#app.use(
      compression({
        threshold: 0,
      }),
    );

    Logger.info(`[SERVER] Loaded default compression (deflate, gzip)`);
    Logger.warn(
      `[SERVER] !!! Please note: We recommend you to disable compression on production environments. Loadbalancers and reverse proxies are 9/10 times faster at doing this job... !!!`,
    );
  }
}

export { Server };
