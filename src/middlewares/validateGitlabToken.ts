import { NextFunction, Request, Response } from 'express';

import { config } from '@/server/Config';

const gitlabSecretToken = config.GITLAB_SECRET_TOKEN;

function validateGitlabToken(req: Request, res: Response, next: NextFunction) {
  const gitlabToken = req.header('X-Gitlab-Token');

  if (!gitlabToken || gitlabToken !== gitlabSecretToken) {
    res.status(401).send('Invalid GitLab Token');
    return;
  }

  next();
}

export { validateGitlabToken };
