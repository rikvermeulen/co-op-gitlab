import dotenv from 'dotenv';

import { Config } from './types';

dotenv.config();

const config: Config = {
  app: {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    URL: process.env.URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },
  gitlab: {
    GITLAB_HOST: process.env.GITLAB_HOST,
    GITLAB_TOKEN: process.env.GITLAB_TOKEN,
    GITLAB_SECRET_TOKEN: process.env.GITLAB_SECRET_TOKEN,
  },
  openai: {
    OPENAI_KEY: process.env.OPENAI_KEY,
    OPENAI_ORG: process.env.OPENAI_ORG,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  },
  slack: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_CHANNEL: process.env.SLACK_CHANNEL,
  },
  database: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
  },
  api: {
    secret: process.env.JWT_SECRET || '',
  },
};

export { config };
