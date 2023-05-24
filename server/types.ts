import { Request, Response } from 'express';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  COPY = 'COPY',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PURGE = 'PURGE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
}

export interface RouterMethods {
  get: HttpMethod;
  post: HttpMethod;
  put: HttpMethod;
  patch: HttpMethod;
  delete: HttpMethod;
  copy: HttpMethod;
  head: HttpMethod;
  options: HttpMethod;
  purge: HttpMethod;
  lock: HttpMethod;
  unlock: HttpMethod;
}

export interface Config {
  PORT: string | undefined;
  HOST: string | undefined;
  URL: string | undefined;
  GITLAB_HOST: string | undefined;
  GITLAB_TOKEN: string | undefined;
  GITLAB_SECRET_TOKEN: string | undefined;
  OPENAI_KEY: string | undefined;
  OPENAI_ORG: string | undefined;
  OPENAI_MODEL: string | undefined;
  SLACK_BOT_TOKEN: string | undefined;
  SLACK_CHANNEL: string | undefined;
  LOG_LEVEL: string | undefined;
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
