import { Request, Response } from 'express';

export interface RouterMethods {
  get: string;
  post: string;
  put: string;
  patch: string;
  delete: string;
  copy: string;
  head: string;
  options: string;
  purge: string;
  lock: string;
  unlock: string;
}

export interface Route {
  path: string;
  method?: string;
  controller?: any;
  handler?: (req: Request, res: Response) => void;
  middlewares: Array<Middleware>;
}

export type Handler = (req: Request, res: Response) => void;

export type Middleware = (req: Request, res: Response, next: () => void) => void;
