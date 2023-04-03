import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  URL: process.env.URL,
  GITLAB_HOST: process.env.GITLAB_HOST,
  GITLAB_TOKEN: process.env.GITLAB_TOKEN,

  OPENAI_KEY: process.env.OPENAI_KEY,
  OPENAI_ORG: process.env.OPENAI_ORG,
};

export { config };
