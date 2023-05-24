import dotenv from 'dotenv';

import { Config } from './types';

dotenv.config();

const config: Config = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  URL: process.env.URL,
  GITLAB_HOST: process.env.GITLAB_HOST,
  GITLAB_TOKEN: process.env.GITLAB_TOKEN,
  GITLAB_SECRET_TOKEN: process.env.GITLAB_SECRET_TOKEN,

  OPENAI_KEY: process.env.OPENAI_KEY,
  OPENAI_ORG: process.env.OPENAI_ORG,
  OPENAI_MODEL: process.env.OPENAI_MODEL,

  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_CHANNEL: process.env.SLACK_CHANNEL,

  LOG_LEVEL: process.env.LOG_LEVEL,
};

export { config };
