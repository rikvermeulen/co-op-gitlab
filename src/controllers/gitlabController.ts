import { Request, Response } from 'express';
import { Controller } from '@/server/Controllers';
import { Slack } from '@/services/slack';
import { validateMergeRequest } from '@/util/validateMergeRequest';
import { logger } from '@/server/Logger';

import type { GitlabEvent } from '@/types/index';

const controller = new Controller('gitlabController');

controller.post('/', [], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;

  if (event === 'Merge Request Hook') {
    try {
      await handleMergeRequestEvent(payload);
    } catch (error) {
      console.error('Error handling merge request event:', error);
    }
  }

  res.sendStatus(200);
});

async function handleMergeRequestEvent(payload: GitlabEvent) {
  const user = payload.user.name;
  const { id, name } = payload.project;
  const { state, action, iid, url, source_branch, target_branch, work_in_progress } =
    payload.object_attributes;

  if (!id || !iid) throw new Error('Invalid project ID or merge request ID');

  if (action === 'open' && state === 'opened' && !work_in_progress) {
    try {
      const slack = new Slack();
      const text = `Merge Request: for ${name} created by ${user} - ${source_branch} -> ${target_branch} - ${url}`;

      const resultSlack = await slack.sendMessage('pull-request-dev', text);
      logger.info('Slack message sent', resultSlack);
    } catch (error) {
      logger.error('Error sending message to Slack:', error);
    }

    try {
      const mergeRequest = await validateMergeRequest(id, iid);
      logger.info('Merge request validated', mergeRequest);
    } catch (error) {
      logger.error('Error validating merge request:', error);
    }
  }
}

export { controller };
